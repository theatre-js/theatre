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
import type {PointerToPrismProvider, Prism, Pointer} from '@theatre/dataverse'

import {Atom, getPointerParts, pointer, prism, val} from '@theatre/dataverse'
import type SheetObjectTemplate from './SheetObjectTemplate'
import TheatreSheetObject from './TheatreSheetObject'
import type {Interpolator, PropTypeConfig} from '@theatre/core/propTypes'
import {getPropConfigByPath} from '@theatre/shared/propTypes/utils'
import type {ILogger, IUtilContext} from '@theatre/shared/logger'

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
export default class SheetObject implements PointerToPrismProvider {
  get type(): 'Theatre_SheetObject' {
    return 'Theatre_SheetObject'
  }
  readonly $$isPointerToPrismProvider: true = true
  readonly address: SheetObjectAddress
  readonly publicApi: TheatreSheetObject
  private readonly _initialValue = new Atom<SheetObjectPropsValue>({})
  private readonly _cache = new SimpleCache()
  readonly _logger: ILogger
  private readonly _internalUtilCtx: IUtilContext

  constructor(
    readonly sheet: Sheet,
    readonly template: SheetObjectTemplate,
    readonly nativeObject: unknown,
  ) {
    this._logger = sheet._logger.named(
      'SheetObject',
      template.address.objectKey,
    )
    this._logger._trace('creating object')
    this._internalUtilCtx = {logger: this._logger.utilFor.internal()}
    this.address = {
      ...template.address,
      sheetInstanceId: sheet.address.sheetInstanceId,
    }

    this.publicApi = new TheatreSheetObject(this)
  }

  getValues(): Prism<Pointer<SheetObjectPropsValue>> {
    // Cache the prism because only one is needed per SheetObject.
    // Also, if `onValuesChange()` is unsubscribed from, this prism will go cold
    // and free its resources. So it's no problem to still keep it on the cache.
    return this._cache.get('getValues()', () =>
      prism(() => {
        /**
         * The final value is a deep-merge of defaults + initial + static + sequenced values.
         * We calculate each of those separately, and deep merge them one-by-one until
         * we get the final value.
         *
         * Notes on performance: This prism _will_ recalculate every time any value of any prop changes,
         * including nested props. In other words, if foo.bar.baz changes, this prism will recalculate. Even more,
         * if boo.bar.baz is sequenced and the sequence is playing, this prism will recalculate on every frame.
         * This might sound inefficient, but we have a few tricks to make it fast:
         *
         * First, on each recalculation, most of the prisms that this prism depends on will not have changed,
         * and so reading them is cheap. For example, if foo.bar.baz changed due to being sequenced, but
         * foo.bar2 hasn't because it is static, reading foo.bar2 will be cheap.
         *
         * Secondly, as we deep merge each layer, we use a cache to avoid recalculating the same merge over and over.
         *
         * Third, we have sorted our layers in the order of how likely they are to change. For example, sequenced
         * values are likely to change on each frame, so they're layerd on last. Static values seldom change,
         * and default values almost never do, so they're layered on first.
         *
         * All of this means that most the work of this prism is done on the very first calculation, and subsequent
         * recalculations are cheap.
         *
         * Question: What about object.initialValue which _could_ change on every frame, but isn't layerd on last?
         * Answer: initialValue is seldom used (it's only used in `@theatre/r3f` as far as we know). So this won't
         * affect the majority of use cases. And in case it _is_ used, it's better for us to implement an alternative
         * to `object.getValues()` that does not layer initialValue (and also skips defaultValue too). This is discussed
         * in issue [P-208](https://linear.app/theatre/issue/P-208/use-overrides-rather-than-final-values-in-r3f).
         */

        /**
         * The lowest layer is the default value of the root prop. Since an object's config
         * _could_ change, we read it as a prism. Otherwise, we could have just `getDefaultsOfPropTypeConfig(this.template.staticConfig)`.
         *
         * Note: If studio is not present, there is no known use-case for the config of an object to change on the fly, so
         * we could read this value statically.
         */
        const defaults = val(this.template.getDefaultValues())

        /**
         * The second layer is the initialValue, which is what the user sets with `sheetObject.initialValue = someValue`.
         */
        const initial = val(this._initialValue.pointer)

        /**
         * For each deep-merge, we need a separate WeakMap to cache the result of the merge. See {@link deepMergeWithCache}
         * to learn how that works.
         *
         * Here we use a `prism.memo()` so we can re-use our cache.
         */
        const withInitialCache = prism.memo(
          'withInitialCache',
          () => new WeakMap(),
          [],
        )

        // deep-merge the defaultValues with the initialValues.
        const withInitial = deepMergeWithCache(
          defaults,
          initial,
          withInitialCache,
        )

        /**
         * The third layer are the static values. Since these are (currently) commnon to all instances
         * of the same SheetObject, we can read it from the template.
         */
        const statics = val(this.template.getStaticValues())

        // Similar to above, we need a separate but stable WeakMap to cache the result of merging the static values
        const withStaticsCache = prism.memo(
          'withStatics',
          () => new WeakMap(),
          [],
        )

        // deep-merge the static values with the previous layer
        const withStatics = deepMergeWithCache(
          withInitial,
          statics,
          withStaticsCache,
        )

        /**
         * The final values (all layers merged together) will be put inside this variable
         */
        let final = withStatics
        /**
         * The sequenced values will be put in this variable
         */
        let sequenced

        {
          // NOTE: we're reading the sequenced values as a prism to a pointer. This should be refactored
          // to a simple pointer.
          const pointerToSequencedValuesD = prism.memo(
            'seq',
            () => this.getSequencedValues(),
            [],
          )

          // like before, we need a separate but stable WeakMap to cache the result of merging the sequenced values
          // on top of the last layer
          const withSeqsCache = prism.memo(
            'withSeqsCache',
            () => new WeakMap(),
            [],
          )

          // read the sequenced values
          // (val(val(x))) unwraps the pointer and the prism
          sequenced = val(val(pointerToSequencedValuesD))

          // deep-merge the sequenced values with the previous layer
          const withSeqs = deepMergeWithCache(final, sequenced, withSeqsCache)
          final = withSeqs
        }

        // Finally, we wrap the final value in an atom, so we can return a pointer to it.
        const a = valToAtom<SheetObjectPropsValue>('finalAtom', final)

        // Since we only return a pointer, the value cannot be mutated from outside of this prism.
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

  pointerToPrism<P>(pointer: Pointer<P>): Prism<P> {
    const {path} = getPointerParts(pointer)
    /**
     * @remarks
     * TODO perf: Too much indirection here.
     */
    return prism(() => {
      const allValuesP = val(this.getValues())
      return val(pointerDeep(allValuesP as $FixMe, path)) as SerializableMap
    }) as $IntentionalAny as Prism<P>
  }

  /**
   * Returns values of props that are sequenced.
   */
  getSequencedValues(): Prism<Pointer<SheetObjectPropsValue>> {
    return prism(() => {
      const tracksToProcessD = prism.memo(
        'tracksToProcess',
        () => this.template.getArrayOfValidSequenceTracks(),
        [],
      )

      const tracksToProcess = val(tracksToProcessD)
      const valsAtom = new Atom<SheetObjectPropsValue>({})
      const config = val(this.template.configPointer)

      prism.effect(
        'processTracks',
        () => {
          const untaps: Array<() => void> = []

          for (const {trackId, pathToProp} of tracksToProcess) {
            const pr = this._trackIdToPrism(trackId)
            const propConfig = getPropConfigByPath(
              config,
              pathToProp,
            )! as Extract<PropTypeConfig, {interpolate: $IntentionalAny}>

            const deserializeAndSanitize = propConfig.deserializeAndSanitize
            const interpolate =
              propConfig.interpolate! as Interpolator<$IntentionalAny>

            const updateSequenceValueFromItsPrism = () => {
              const triple = pr.getValue()

              if (!triple)
                return valsAtom.setByPointer(
                  (p) => pointerDeep(p, pathToProp),
                  undefined,
                )

              const leftDeserialized = deserializeAndSanitize(triple.left)

              const left =
                leftDeserialized === undefined
                  ? propConfig.default
                  : leftDeserialized

              if (triple.right === undefined)
                return valsAtom.setByPointer(
                  (p) => pointerDeep(p, pathToProp),
                  left,
                )

              const rightDeserialized = deserializeAndSanitize(triple.right)
              const right =
                rightDeserialized === undefined
                  ? propConfig.default
                  : rightDeserialized

              return valsAtom.setByPointer(
                (p) => pointerDeep(p, pathToProp),
                interpolate(left, right, triple.progression),
              )
            }
            const untap = pr.onStale(updateSequenceValueFromItsPrism)

            updateSequenceValueFromItsPrism()
            untaps.push(untap)
          }
          return () => {
            for (const untap of untaps) {
              untap()
            }
          }
        },
        [config, ...tracksToProcess],
      )

      return valsAtom.pointer
    })
  }

  protected _trackIdToPrism(
    trackId: SequenceTrackId,
  ): Prism<InterpolationTriple | undefined> {
    const trackP =
      this.template.project.pointers.historic.sheetsById[this.address.sheetId]
        .sequence.tracksByObject[this.address.objectKey].trackData[trackId]

    const timeD = this.sheet.getSequence().positionPrism

    return interpolationTripleAtPosition(this._internalUtilCtx, trackP, timeD)
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
    this._initialValue.set(val)
  }
}
