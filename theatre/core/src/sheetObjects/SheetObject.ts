import type {InterpolationTriple} from '@theatre/core/sequences/interpolationTripleAtPosition'
import interpolationTripleAtPosition from '@theatre/core/sequences/interpolationTripleAtPosition'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import deepMergeWithCache from '@theatre/shared/utils/deepMergeWithCache'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
  $IntentionalAny,
  DeepPartialOfSerializableValue,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
import {valToAtom} from '@theatre/shared/utils/valToAtom'
import type {
  IdentityDerivationProvider,
  IDerivation,
  Pointer,
} from '@theatre/dataverse'

import {Atom, getPointerParts, pointer, prism, val} from '@theatre/dataverse'
import type SheetObjectTemplate from './SheetObjectTemplate'
import TheatreSheetObject from './TheatreSheetObject'
import type {Interpolator, PropTypeConfig} from '@theatre/core/propTypes'
import {getPropConfigByPath} from '@theatre/shared/propTypes/utils'

/**
 * Internally, the sheet's actual configured value is not a specific type, since we
 * can change the prop config at will, as such this is an alias of {@link SerializableMap}.
 *
 * TODO: Incorporate this knowledge into SheetObject & TemplateSheetObject
 */
type SheetObjectPropsValue = SerializableMap

/**
 * An object on a sheet consisting of zero or more properties which can
 * be overridden statically or overridden by being sequenced.
 *
 * Note that this cannot be generic over `Props`, since the user is
 * able to change prop configs for the sheet object's properties.
 */
export default class SheetObject implements IdentityDerivationProvider {
  get type(): 'Theatre_SheetObject' {
    return 'Theatre_SheetObject'
  }
  readonly $$isIdentityDerivationProvider: true = true
  readonly address: SheetObjectAddress
  readonly publicApi: TheatreSheetObject
  private readonly _initialValue = new Atom<SheetObjectPropsValue>({})
  private readonly _cache = new SimpleCache()

  constructor(
    readonly sheet: Sheet,
    readonly template: SheetObjectTemplate,
    readonly nativeObject: unknown,
  ) {
    this.address = {
      ...template.address,
      sheetInstanceId: sheet.address.sheetInstanceId,
    }

    this.publicApi = new TheatreSheetObject(this)
  }

  getValues(): IDerivation<Pointer<SheetObjectPropsValue>> {
    return this._cache.get('getValues()', () =>
      prism(() => {
        const defaults = val(this.template.getDefaultValues())

        const initial = val(this._initialValue.pointer)

        const withInitialCache = prism.memo(
          'withInitialCache',
          () => new WeakMap(),
          [],
        )

        const withInitial = deepMergeWithCache(
          defaults,
          initial,
          withInitialCache,
        )

        const statics = val(this.template.getStaticValues())

        const withStaticsCache = prism.memo(
          'withStatics',
          () => new WeakMap(),
          [],
        )

        const withStatics = deepMergeWithCache(
          withInitial,
          statics,
          withStaticsCache,
        )

        let final = withStatics
        let sequenced

        {
          const pointerToSequencedValuesD = prism.memo(
            'seq',
            () => this.getSequencedValues(),
            [],
          )
          const withSeqsCache = prism.memo(
            'withSeqsCache',
            () => new WeakMap(),
            [],
          )
          sequenced = val(val(pointerToSequencedValuesD))

          const withSeqs = deepMergeWithCache(final, sequenced, withSeqsCache)
          final = withSeqs
        }

        const a = valToAtom<SheetObjectPropsValue>('finalAtom', final)

        return a.pointer
      }),
    )
  }

  getValueByPointer<T extends SerializableValue>(pointer: Pointer<T>): T {
    const allValuesP = val(this.getValues())
    const {path} = getPointerParts(pointer)

    return val(
      pointerDeep(allValuesP as $FixMe, path),
    ) as SerializableValue as T
  }

  getIdentityDerivation(path: Array<string | number>): IDerivation<unknown> {
    /**
     * @remarks
     * TODO perf: Too much indirection here.
     */
    return prism(() => {
      const allValuesP = val(this.getValues())
      return val(pointerDeep(allValuesP as $FixMe, path)) as SerializableMap
    })
  }

  /**
   * Returns values of props that are sequenced.
   */
  getSequencedValues(): IDerivation<Pointer<SheetObjectPropsValue>> {
    return prism(() => {
      const tracksToProcessD = prism.memo(
        'tracksToProcess',
        () => this.template.getArrayOfValidSequenceTracks(),
        [],
      )

      const tracksToProcess = val(tracksToProcessD)
      const valsAtom = new Atom<SheetObjectPropsValue>({})

      prism.effect(
        'processTracks',
        () => {
          const untaps: Array<() => void> = []

          for (const {trackId, pathToProp} of tracksToProcess) {
            const derivation = this._trackIdToDerivation(trackId)
            const propConfig = getPropConfigByPath(
              this.template.config,
              pathToProp,
            )! as Extract<PropTypeConfig, {interpolate: $IntentionalAny}>

            const deserializeAndSanitize = propConfig.deserializeAndSanitize
            const interpolate =
              propConfig.interpolate! as Interpolator<$IntentionalAny>

            const updateSequenceValueFromItsDerivation = () => {
              const triple = derivation.getValue()

              if (!triple) return valsAtom.setIn(pathToProp, undefined)

              const leftDeserialized = deserializeAndSanitize(triple.left)

              const left =
                leftDeserialized === undefined
                  ? propConfig.default
                  : leftDeserialized

              if (triple.right === undefined)
                return valsAtom.setIn(pathToProp, left)

              const rightDeserialized = deserializeAndSanitize(triple.right)
              const right =
                rightDeserialized === undefined
                  ? propConfig.default
                  : rightDeserialized

              return valsAtom.setIn(
                pathToProp,
                interpolate(left, right, triple.progression),
              )
            }
            const untap = derivation
              .changesWithoutValues()
              .tap(updateSequenceValueFromItsDerivation)

            updateSequenceValueFromItsDerivation()
            untaps.push(untap)
          }
          return () => {
            for (const untap of untaps) {
              untap()
            }
          }
        },
        tracksToProcess,
      )

      return valsAtom.pointer
    })
  }

  protected _trackIdToDerivation(
    trackId: SequenceTrackId,
  ): IDerivation<InterpolationTriple | undefined> {
    const trackP =
      this.template.project.pointers.historic.sheetsById[this.address.sheetId]
        .sequence.tracksByObject[this.address.objectKey].trackData[trackId]

    const timeD = this.sheet.getSequence().positionDerivation

    return interpolationTripleAtPosition(trackP, timeD)
  }

  get propsP(): Pointer<SheetObjectPropsValue> {
    return this._cache.get('propsP', () =>
      pointer<{props: {}}>({root: this, path: []}),
    ) as $FixMe
  }

  validateValue(
    pointer: Pointer<SheetObjectPropsValue>,
    value: DeepPartialOfSerializableValue<SheetObjectPropsValue>,
  ) {
    // @todo
  }

  setInitialValue(val: DeepPartialOfSerializableValue<SheetObjectPropsValue>) {
    this.validateValue(this.propsP, val)
    this._initialValue.setState(val)
  }
}
