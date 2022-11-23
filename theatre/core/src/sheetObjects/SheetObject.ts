import type {InterpolationTriple} from '@theatre/core/sequences/interpolationTripleAtPosition'
import interpolationTripleAtPosition from '@theatre/core/sequences/interpolationTripleAtPosition'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {
  PathToProp,
  SheetObjectAddress,
} from '@theatre/shared/utils/addresses'

import deepMergeWithCache from '@theatre/shared/utils/deepMergeWithCache'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {
  $FixMe,
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
import type {ILogger, IUtilContext} from '@theatre/shared/logger'
import type {PathedDerivable} from '@theatre/dataverse/src/Atom'
import {pathedDerivation} from '@theatre/dataverse/src/Atom'
import getDeep from '@theatre/shared/utils/getDeep'
import type {IPropPathToTrackIdTree} from './SheetObjectTemplate'

type IPropPathToValueTree =
  | {
      [propName in string]?: any | IPropPathToValueTree
    }
  | any

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

  private initOrUpdateFinalAtom(): Pointer<SheetObjectPropsValue> {
    prism.ensurePrism()
    // `prism.memo` initialises these values the first time `initOrUpdateFinalAtom` is called
    const initialsCache = prism.memo('initialsCache', () => new WeakMap(), [])
    const staticsCache = prism.memo('staticsCache', () => new WeakMap(), [])
    const seqsCache = prism.memo('seqsCache', () => new WeakMap(), [])
    const finalAtom = prism.memo(
      'finalAtom',
      () => new Atom<SheetObjectPropsValue>({}),
      [],
    )

    const defaults = val(this.template.defaultValues)
    const initial = val(this._initialValue.pointer)
    const statics = val(this.template.staticValues)
    const sequenced = val(this.sequencedValues)

    // deepMergeWithCache is used so that things are not unecessarily recalculated if one of
    // defaults, initial, statics, or sequenced hasn't changed
    const state = deepMergeWithCache(
      deepMergeWithCache(
        deepMergeWithCache(defaults, initial, initialsCache),
        statics,
        staticsCache,
      ),
      sequenced,
      seqsCache,
    )

    const exprs = val(this.expressionValues)
    // apply expr functions to respective places
    const exprdState = objMap(
      [],
      state,
      (val: SerializablePrimitive, p: (string | number)[]) =>
        getDeep(exprs, p) instanceof Function
          ? (getDeep(exprs, p) as ExprFunction)(state)
          : val,
    )

    finalAtom.setState(exprdState)
    return finalAtom.pointer
  }
  get values(): IDerivation<Pointer<SheetObjectPropsValue>> {
    // The cache is for lazy initialization of this derivation
    return this._cache.getOrInit('values', () =>
      prism(() => this.initOrUpdateFinalAtom()),
    )
  }
  get values2(): Pointer<SheetObjectPropsValue> {
    // The cache is for lazy initialization of this derivation
    return this._cache.getOrInit('values', () =>
      pointer({
        root: {
          [pathedDerivation]: this.ok.bind(this),
        },
      }),
    )
  }

  get values3(): Pointer<SheetObjectPropsValue> {
    return this._cache.getOrInit('values3', () =>
      combinePointers({
        combiner: ([valueP, exprP]) => {
          const value = val(valueP)
          const expr = val(exprP)
          return expr instanceof Function ? expr(value) : value
        },
        pointers: [
          combinePointersOverrideValues(
            this.template.defaultValues,
            this._initialValue.pointer,
            this.template.staticValues,
            this.sequencedValues,
          ),
          this.expressionValues,
        ],
      }),
    )
  }
  [pathedDerivation] = (path: (string | number)[]) =>
    prism(() => val(pointerDeep(this.values3, path)))

  ok(path: (string | number)[]) {
    return prism(() => {
      const defaults = val(
        pointerDeep(this.template.defaultValues, path),
      ) as SerializableMap
      const initial = pointerDeep(this._initialValue.pointer, path)
      const statics = pointerDeep(this.template.staticValues, path)
      const sequenced = pointerDeep(this.sequencedValues, path)

      // deepMergeWithCache is used so that things are not unecessarily recalculated if one of
      // defaults, initial, statics, or sequenced hasn't changed
      const state = objMap(
        [],
        defaults,
        (value: SerializablePrimitive, p: (string | number)[]) =>
          val(pointerDeep(sequenced, p)) ?? // null is a valid value so this should be !== undefined rather
          val(pointerDeep(statics, p)) ??
          val(pointerDeep(initial, p)) ??
          value,
      )

      const exprs = val(
        pointerDeep(this.expressionValues, path),
      ) as SerializableMap
      // apply expr functions to respective places
      const exprdState = objMap(
        [],
        state,
        (val: SerializablePrimitive, p: (string | number)[]) => {
          const expr = getDeep(exprs, p)
          return expr instanceof Function ? expr(state) : val
        },
      )

      return exprdState
    })
  }

  private sequencedValuesPathedDerivation(
    path: (string | number)[],
  ): IDerivation<IPropPathToValueTree | undefined> {
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
  get sequencedValues(): Pointer<SheetObjectPropsValue> {
    // lazy initialization with cache
    return this._cache.getOrInit('sequencedValues', () =>
      pointer({
        root: {
          [pathedDerivation]: this.sequencedValuesPathedDerivation.bind(this),
          //pathedDerivationFromPointerDerivation(allSequencedValuesD),
        },
      }),
    )
  }

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
  get expressionValues(): Pointer<SheetObjectPropsValue> {
    // lazy initialization with cache
    return this._cache.getOrInit('expressionValues', () =>
      pointer({
        root: {
          [pathedDerivation]: this.expressionValuesPathedDerivation.bind(this),
        },
      }),
    )
  }

  protected _trackIdToDerivation(
    trackId: SequenceTrackId,
  ): IDerivation<InterpolationTriple | undefined> {
    const trackP =
      this.template.project.pointers.historic.sheetsById[this.address.sheetId]
        .sequence.tracksByObject[this.address.objectKey].trackData[trackId]

    const timeD = this.sheet.getSequence().positionDerivation

    return interpolationTripleAtPosition(this._internalUtilCtx, trackP, timeD)
  }

  get propsP(): Pointer<SheetObjectPropsValue> {
    return this._cache.getOrInit('propsP', () =>
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

const pathedDerivationFromPointerDerivation =
  <T>(d: IDerivation<Pointer<T>>) =>
  (path: (string | number)[]): IDerivation<unknown> =>
    prism(() => val(pointerDeep(val(d), path)))

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

/*
// dependency-freee (defaults+initial+static+sequenced)
// dependent (expression)
*/

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
