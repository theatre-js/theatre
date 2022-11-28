import type {InterpolationTriple} from '@theatre/core/sequences/interpolationTripleAtPosition'
import interpolationTripleAtPosition from '@theatre/core/sequences/interpolationTripleAtPosition'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {
  PathToProp,
  SheetObjectAddress,
} from '@theatre/shared/utils/addresses'

import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import type {
  $IntentionalAny,
  DeepPartialOfSerializableValue,
  SerializableMap,
  SerializablePrimitive,
  SerializableValue,
} from '@theatre/shared/utils/types'
import type {IDerivation, Pointer} from '@theatre/dataverse'

import {Atom, pointer, prism, val} from '@theatre/dataverse'
import type SheetObjectTemplate from './SheetObjectTemplate'
import TheatreSheetObject from './TheatreSheetObject'
import type {
  Interpolator,
  PropTypeConfig_AllSimples,
} from '@theatre/core/propTypes'
import {getPropConfigByPath} from '@theatre/shared/propTypes/utils'
import type {PathedDerivable} from '@theatre/dataverse/src/Atom'
import {pathedDerivation} from '@theatre/dataverse/src/Atom'
import getDeep from '@theatre/shared/utils/getDeep'
import type {IPropPathToTrackIdTree} from './SheetObjectTemplate'

type ExprFunction = (arg: SheetObjectPropsValue) => any
type IPropPathToExprFunctionTree =
  | {
      [propName in string]?: ExprFunction | IPropPathToExprFunctionTree
    }
  | ExprFunction

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
export default class SheetObject implements PathedDerivable {
  get type(): 'Theatre_SheetObject' {
    return 'Theatre_SheetObject'
  }
  readonly address: SheetObjectAddress
  readonly publicApi: TheatreSheetObject
  private readonly _initialValue = new Atom<SheetObjectPropsValue>({})

  readonly preExpressionValues: Pointer<SheetObjectPropsValue>
  readonly values: Pointer<SheetObjectPropsValue>

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

    this.preExpressionValues = combinePointersOverrideValues(
      this.template.defaultValues,
      this._initialValue.pointer,
      this.template.staticValues,
      this.sequencedValues,
    )
    this.values = combinePointers({
      combiner: ([valueP, exprP]) => {
        const expr = val(exprP)
        return expr instanceof Function
          ? expr(val(this.preExpressionValues))
          : val(valueP)
      },
      pointers: [this.preExpressionValues, this.expressionValues],
    })
  }

  [pathedDerivation] = (path: (string | number)[]) =>
    prism(() => val(pointerDeep(this.values, path)))

  propsP: Pointer<SheetObjectPropsValue> = pointer({
    root: this,
  })

  private sequencedValuesPathedDerivation(
    path: (string | number)[],
  ): IDerivation<SheetObjectPropsValue | undefined> {
    // should be cached per-path
    return prism(() => {
      const tracks = val(this.template.getMapOfValidSequenceTracks_forStudio()) // `getMapOfValidSequenceTracks_forStudio` should return a pointer for this
      const trackTree = getDeep(tracks, path) as IPropPathToTrackIdTree
      const config = val(this.template.configPointer)

      return objMap(
        path,
        trackTree,
        (trackId: SequenceTrackId, p: PathToProp) =>
          interpolateTriple(
            getPropConfigByPath(config, p) as PropTypeConfig_AllSimples,
            val(this._trackIdToDerivation(trackId)),
          ),
      )
    }) // just need to cache these objects by path and perf is off the chain
  }
  sequencedValues: Pointer<SheetObjectPropsValue> = pointer({
    root: {
      [pathedDerivation]: this.sequencedValuesPathedDerivation.bind(this),
      //pathedDerivationFromPointerDerivation(allSequencedValuesD),
    },
  })

  private expressionValuesPathedDerivation(
    path: (string | number)[],
  ): IDerivation<IPropPathToExprFunctionTree | undefined> {
    // prism should be cached per-path
    return prism(() => {
      const exprP =
        this.template.project.pointers.historic.sheetsById[this.address.sheetId]
          .expressionOverrides.byObject[this.address.objectKey]

      return objMap(
        path,
        val(pointerDeep(exprP, path)),
        (expr: string | undefined) => {
          if (expr === undefined) return
          const args = Object.keys(val(this.template.defaultValues)!)
          const destructureArgsString = `{${args.join(',')}}`
          const fnString = `(${destructureArgsString}) => ${expr}`
          return tryEvalFn(fnString)
        },
      )
    }) // just need to cache these objects by path and perf is off the chain
  }
  expressionValues: Pointer<SheetObjectPropsValue> = pointer({
    root: {
      [pathedDerivation]: this.expressionValuesPathedDerivation.bind(this),
    },
  })

  protected _trackIdToDerivation(
    trackId: SequenceTrackId,
  ): IDerivation<InterpolationTriple | undefined> {
    const trackP =
      this.template.project.pointers.historic.sheetsById[this.address.sheetId]
        .sequence.tracksByObject[this.address.objectKey].trackData[trackId]

    const timeD = this.sheet.getSequence().positionDerivation

    return interpolationTripleAtPosition(trackP, timeD)
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

const interpolateTriple = (
  propConfig: PropTypeConfig_AllSimples,
  triple: InterpolationTriple | undefined,
) => {
  const interpolate = propConfig.interpolate! as Interpolator<$IntentionalAny>

  const left = deserializeAndSanitizeOrDefault(propConfig, triple?.left)
  const right = deserializeAndSanitizeOrDefault(propConfig, triple?.right)

  return triple === undefined
    ? undefined
    : right === undefined
    ? left
    : interpolate(left, right, triple.progression)
}

const deserializeAndSanitizeOrDefault = (
  propConfig: PropTypeConfig_AllSimples,
  value: SerializableValue<SerializablePrimitive> | undefined,
) => {
  if (value === undefined) return undefined
  const deserialized = propConfig.deserializeAndSanitize(value)
  return deserialized === undefined ? propConfig.default : deserialized
}

const isObj = (value: any): value is Object =>
  typeof value === 'object' && !Array.isArray(value) && value !== null
function objMap(path: (number | string)[], value: any, valMap: any): any {
  if (!isObj(value)) return valMap(value, path)
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [
      key,
      objMap([...path, key], value, valMap),
    ]),
  )
}

function tryEvalFn(fnStr: string) {
  return (...args: any) => {
    try {
      return eval(fnStr)(...args)
    } catch (e) {}
  }
}

function combinePointers({
  combiner,
  pointers,
}: {
  combiner: (
    pointersAtPath: Pointer<SerializableMap>[],
  ) => SerializableMap | undefined
  pointers: Pointer<SerializableMap>[]
}): Pointer<SerializableMap> {
  return pointer({
    root: {
      [pathedDerivation]: (path: (string | number)[]) =>
        prism(() =>
          objMap(
            path,
            val(pointerDeep(pointers[0], path)),
            (_: any, path: (string | number)[]) =>
              combiner(
                pointers.map(
                  (pointer) =>
                    pointerDeep(pointer, path) as Pointer<SerializableMap>,
                ),
              ),
          ),
        ),
    },
  })
}

function combinePointersOverrideValues(
  ...overrides: Pointer<SerializableMap>[]
): Pointer<SerializableMap> {
  return combinePointers({
    combiner: (pds) =>
      pds.reduceRight(
        (prev, cur) => prev ?? val(cur),
        undefined as SerializableMap | undefined,
      ),
    pointers: overrides,
  })
}
