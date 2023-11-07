import deepEqual from '@theatre/utils/deepEqual'
import type {$IntentionalAny} from './types'
import * as immer from 'immer'
import setDeep from 'lodash-es/set'
import memoizeFn from '@theatre/utils/memoizeFn'

type BranchName = 'base' | string

type Branch = {
  $boxedValue?: any
  $mapProps?: {
    [key in string]?: Cell
  }
}

export type Cell = {
  $type: [type: 'map' | 'boxed' | 'deleted', branchName: BranchName]
  $branches?: {
    [asOf in BranchName]?: Branch
  }
}

type CellToJSON<T extends Cell> = T extends {
  $type: ['boxed', any]
}
  ? CellBoxedToJSON<T>
  : T extends {$type: ['map']}
  ? MapCellToJSON<T>
  : never

type CellBoxedToJSON<T extends Cell> = T['$branches'] extends {
  [key: string]: {$boxedValue: infer V}
}
  ? V
  : never

type MapCellToJSON<T extends Cell> = T['$branches'] extends {
  [key: string]: {$mapProps: infer V}
}
  ? {
      [Key in keyof V]: V[Key] extends Cell ? CellToJSON<V[Key]> : never
    }
  : never

export type Root = Cell

const NOT_DEFINED = {}

type Transaction = {clock: number; ops: Ops}

export type Ops = Op[]

type Op = ChnangeTypeOp | SetBoxedValue

type ChnangeTypeOp = {
  type: 'ChangeType'
  path: Array<[branchName: BranchName, mapProp: string]>
  value: Cell['$type']
}

type SetBoxedValue = {
  type: 'SetBoxedValue'
  path: Array<[branchName: BranchName, mapProp: string]>
  branchName: BranchName
  value: any
}

type PathSegment = [branchName: BranchName, mapProp: string]

type Path = PathSegment[]

function isCell(v: unknown): v is Cell {
  if (typeof v !== 'object' || v === null) return false
  const $type = (v as any).$type
  if (!Array.isArray($type)) return false
  if ($type.length !== 2 && $type.length !== 1) return false
  if (typeof $type[0] !== 'string') return false
  const [type, branchName] = $type
  if (type === 'map' || type === 'boxed' || type === 'deleted') return true
  return false
}

export function makeDraft<S extends Cell>(
  base: any,
): [draft: any, finish: () => [cell: Cell, forwardOps: Ops, backwardOps: Ops]] {
  if (!isPlainObject(base)) {
    throw Error(`Base must be a plain object`)
  }
  base = isCell(base)
    ? base
    : ({
        $type: ['map', 'base'],
        $branches: {base: {$mapProps: base}},
      } as Cell)

  const immerDraft = immer.createDraft(base)
  const state: State = {
    imo: immerDraft,
  }

  const draft = new Proxy(state, traps)
  const finish = (): [cell: Cell, forwardOps: Ops, backwardOps: Ops] => {
    const cell = immer.finishDraft(immerDraft)
    const forwardOps = compare(base, cell)
    const backwardOps = compare(cell, base)

    return [cell, forwardOps, backwardOps]
  }

  return [draft, finish]
}

export function change(
  base: any,
  fn: (draft: any) => void,
): [cell: any, ops: Ops, backwardOps: Ops] {
  const [draft, finish] = makeDraft(base)
  fn(draft)
  return finish()
}

export function fromOps(base: any, ops: Ops): [cell: any] {
  if (!isPlainObject(base)) {
    throw Error(`Base must be a plain object`)
  }
  base = isCell(base)
    ? base
    : ({
        $type: ['map', 'base'],
        $branches: {base: {$mapProps: base}},
      } as Cell)

  const immerDraft = immer.createDraft(base)
  const state: State = {
    imo: immerDraft,
  }

  for (const op of ops) {
    const flatPath = op.path
      .map(([branchName, mapProp]) => [
        '$branches',
        branchName,
        '$mapProps',
        mapProp,
      ])
      .flat()
    if (op.type === 'ChangeType') {
      const [type, branchName] = op.value
      setDeep(immerDraft, [...flatPath, '$type'], [type, branchName])
    } else if (op.type === 'SetBoxedValue') {
      setDeep(
        immerDraft,
        [...flatPath, '$branches', op.branchName, '$boxedValue'],
        op.value,
      )
    } else {
      throw Error(`Unrecognized op type: ${(op as $IntentionalAny).type}`)
    }
  }

  return [immer.finishDraft(immerDraft)]
}

function compare(before: Cell, after: Cell): Ops {
  const ops: Ops = []
  compareCell(before, after, [], ops)

  return ops
}

function compareCell(
  before: Cell | undefined,
  after: Cell,
  path: Path,
  ops: Ops,
) {
  if (before === after) return

  if (!deepEqual(before?.$type, after.$type)) {
    const beforeType = before
      ? [before.$type[0], before.$type[1] ?? 'base']
      : null
    const afterType = [after.$type[0], after.$type[1] ?? 'base']
    if (!deepEqual(beforeType, afterType)) {
      ops.push({
        type: 'ChangeType',
        path,
        value: after.$type,
      })
    }
  }

  const [type, branchName] = [after.$type[0], after.$type[1] ?? 'base']
  const afterBranch = after.$branches?.[branchName]
  const beforeBranch = before?.$branches?.[branchName]
  if (afterBranch === beforeBranch) return
  if (!afterBranch) return

  if (type === 'deleted') return

  if (type === 'boxed') {
    if (afterBranch.$boxedValue !== beforeBranch?.$boxedValue) {
      ops.push({
        type: 'SetBoxedValue',
        path,
        branchName,
        value: afterBranch.$boxedValue,
      })
    }
    return
  }

  if (type === 'map') {
    const beforeMapProps = beforeBranch?.$mapProps ?? {}
    const afterMapProps = afterBranch.$mapProps ?? {}
    const afterKeys = Object.keys(afterMapProps)
    for (const prop of afterKeys) {
      compareCell(
        Object.hasOwn(beforeMapProps, prop) ? beforeMapProps[prop] : undefined,
        afterMapProps[prop]!,
        [...path, [branchName, prop]],
        ops,
      )
    }
    const beforeKeys = Object.keys(beforeMapProps)
    for (const prop of beforeKeys) {
      if (!Object.hasOwn(afterMapProps, prop)) {
        ops.push({
          type: 'ChangeType',
          path: [...path, [branchName, prop]],
          value: ['deleted', generateBranchName()],
        })
      }
    }
    return
  }

  throw Error(`Unrecognized type: ${type}`)
}

interface State {
  imo: immer.Draft<Cell>
  parent?: State
}

let _lastBranchName = 0
const generateBranchName = () => {
  _lastBranchName++
  return _lastBranchName.toString()
}

const traps: ProxyHandler<State> = {
  get(state: State, prop) {
    if (prop === DRAFT_STATE) return state

    if (typeof prop !== 'string') return undefined

    const imo = state.imo
    const type = imo.$type[0]
    const branchName = imo.$type[1] ?? 'base'

    if (type === 'deleted')
      throw new Error(`This value is marked as deleted and cannot be accessed`)

    if (type === 'boxed')
      throw new Error(`Implement getting inside a boxed value`)

    if (type === 'map') {
      const mapProps = imo.$branches?.[branchName]?.$mapProps
      if (!mapProps) return undefined
      if (Object.hasOwn(mapProps, prop)) {
        const value = mapProps[prop]

        if (!isCell(value))
          throw Error(
            `mapProps[${prop}] is not an ahistoric cell. this is a bug.`,
          )
        if (value.$type[0] === 'deleted') return undefined
        if (value.$type[0] === 'boxed') {
          const boxedValue =
            value.$branches?.[value.$type[1] ?? 'base']?.$boxedValue
          if (isPlainObject(boxedValue)) {
            throw Error(`Implement getting a mapProp that is a boxed object`)
          } else {
            return boxedValue
          }
        } else if (value.$type[0] === 'map') {
          const subState: State = {
            imo: value,
            parent: state,
          }
          return new Proxy(subState, traps)
        }
      } else {
        return undefined
      }
    }

    throw new Error(`Unrecognized type: ${type}`)
  },
  set(state: State, prop, _value: unknown): boolean {
    if (prop === DRAFT_STATE) throw Error(`Unallowed`)
    if (typeof prop !== 'string')
      throw Error(`Non-string props are not allowed`)

    const value = valueType(_value)

    const imo = state.imo
    const cellType = imo.$type[0]
    const branchName = imo.$type[1] ?? 'base'

    // setting self.a=value, when self is deleted
    if (cellType === 'deleted')
      throw new Error(`This value is marked as deleted and cannot be changed`)

    // setting self.a=value, when self is a boxed value
    if (cellType === 'boxed')
      throw new Error(`Implement setting inside a boxed value`)

    // setting self.a=value when self is a map
    if (cellType === 'map') {
      let branches = imo.$branches
      if (!branches) {
        branches = {}
        imo.$branches = branches
      }

      let branch = branches[branchName]
      if (!branch) {
        branch = {}
        branches[branchName] = branch
      }

      let mapProps = branch.$mapProps
      if (!mapProps) {
        mapProps = {}
        branch.$mapProps = mapProps
      }

      // setting self.a=value when self.a is defined
      if (Object.hasOwn(mapProps, prop)) {
        if (!isCell(mapProps[prop]))
          throw Error(
            `mapProps[${prop}] is not an ahistoric cell. this is a bug.`,
          )
        const currentPropCell = mapProps[prop]!

        // setting self.a={}
        if (value.type === 'map') {
          let currentBranch!: Branch
          // setting self.a={} when self.a is not a map

          if (currentPropCell.$type[0] !== 'map') {
            // we're switching from a non-map to a map, which means if a map was previously set, it was
            // already deleted/overridden to be a boxed value, and the current user hasn't _seen_ the previous
            // map yet. So we should generate a new branchName for the new map.
            const newBranchName = generateBranchName()
            currentPropCell.$type = ['map', newBranchName]
            currentPropCell.$branches ??= {}
            const newBranch: Branch = {$mapProps: {}}
            currentPropCell.$branches[newBranchName] = newBranch
            currentBranch = newBranch
          } else {
            currentPropCell.$branches ??= {}
            currentPropCell.$branches[currentPropCell.$type[1] ?? 'base'] ??= {}
            currentBranch =
              currentPropCell.$branches[currentPropCell.$type[1] ?? 'base']!
          }
          const subState: State = {
            imo: currentPropCell,
            parent: state,
          }
          const proxy = new Proxy(subState, traps)

          const existingProps = Object.keys(proxy)

          // let's delete existing props that are not in the new value
          for (const key of existingProps) {
            if (!Object.hasOwn(value.value, key)) {
              delete (proxy as $IntentionalAny)[key]
            }
          }

          for (const key of Object.keys(value.value)) {
            ;(proxy as $IntentionalAny)[key] = value.value[key]
          }

          return true
        } else if (value.type === 'boxed') {
          if (currentPropCell.$type[0] === 'boxed') {
            currentPropCell.$branches ??= {}
            const branches = currentPropCell.$branches!
            const branchName = currentPropCell.$type[1] ?? 'base'
            branches[branchName] ??= {}
            const branch = branches[branchName]!
            branch.$boxedValue = value.value
            return true
          } else {
            const branchName = generateBranchName()
            currentPropCell.$type = ['boxed', branchName]
            currentPropCell.$branches ??= {}
            const branches = currentPropCell.$branches!
            branches[branchName] ??= {}
            const branch = branches[branchName]!
            branch.$boxedValue = value.value
            return true
          }
        }

        throw new Error(`Unrecognized type: ${currentPropCell.$type[0]}`)
      } else {
        if (value.type === 'boxed') {
          mapProps[prop] = {
            $type: ['boxed', 'base'],
            $branches: {
              base: {
                $boxedValue: value.value,
              },
            },
          }
          return true
        } else if (value.type === 'map') {
          mapProps[prop] = {
            $type: ['map', 'base'],
          }
          const subState: State = {
            imo: mapProps[prop]!,
            parent: state,
          }
          const proxy = new Proxy(subState, traps)
          for (const [k, v] of Object.entries(value.value)) {
            ;(proxy as $IntentionalAny)[k] = v
          }
          return true
        }
        throw Error(`Unrecognized type: ${(value as $IntentionalAny).type}`)
      }
    }

    throw new Error(`Unrecognized type: ${cellType}`)
  },
  has(state: State, prop) {
    throw Error(`Implement has()`)
  },
  ownKeys(state: State) {
    const type = state.imo.$type[0]
    if (type === 'boxed') {
      const value =
        state.imo.$branches?.[state.imo.$type[1] ?? 'base']?.$boxedValue
      if (isPlainObject(value)) {
        return Reflect.ownKeys(value)
      } else {
        return []
      }
    } else if (type === 'deleted') {
      return []
    } else if (type === 'map') {
      const props =
        state.imo.$branches?.[state.imo.$type[1] ?? 'base']?.$mapProps ?? {}
      return Reflect.ownKeys(props).filter(
        (key) => props[key as $IntentionalAny]!.$type[0] !== 'deleted',
      )
    } else {
      throw Error(`Unrecognized type: ${type}`)
    }
  },
  deleteProperty(state: State, prop) {
    if (prop === DRAFT_STATE) throw Error(`Unallowed`)
    if (typeof prop !== 'string')
      throw Error(`Non-string props are not allowed`)

    const imo = state.imo
    const type = imo.$type[0]
    const branchName = imo.$type[1] ?? 'base'

    if (type === 'deleted')
      throw new Error(`This value is marked as deleted and cannot be changed`)

    if (type === 'boxed')
      throw new Error(`Implement deleting inside a boxed value`)

    if (type === 'map') {
      const mapProps = imo.$branches?.[branchName]?.$mapProps
      if (!mapProps) return false
      if (!Object.hasOwn(mapProps, prop)) return false

      if (!isCell(mapProps[prop])) return false
      const currentPropCell = mapProps[prop]!

      if (currentPropCell.$type[0] === 'deleted') return false
      currentPropCell.$type = ['deleted', generateBranchName()]
      return true
    }

    throw new Error(`Unrecognized type: ${type}`)
  },
  getOwnPropertyDescriptor(state: State, prop) {
    const type = state.imo.$type[0]
    if (type === 'boxed') {
      const $boxedValue =
        state.imo.$branches?.[state.imo.$type[1] ?? 'base']?.$boxedValue
      if (isPlainObject($boxedValue)) {
        return Reflect.getOwnPropertyDescriptor($boxedValue, prop)
      } else {
        return undefined
      }
    } else if (type === 'deleted') {
      return undefined
    } else if (type === 'map') {
      const props =
        state.imo.$branches?.[state.imo.$type[1] ?? 'base']?.$mapProps ?? {}
      if (Object.hasOwn(props, prop)) {
        return {
          writable: true,
          configurable: true,
          enumerable: true,
          value: (traps as $IntentionalAny).get(state, prop, {}),
        }
      } else {
        return undefined
      }
    } else {
      throw Error(`Unrecognized type: ${type}`)
    }
  },
  defineProperty(state: State, prop, descriptor) {
    throw Error(`Implement defineProperty()`)
  },
  getPrototypeOf(state: State) {
    const type = state.imo.$type[0]
    if (type === 'boxed') {
      return Object.getPrototypeOf(
        state.imo.$branches?.[state.imo.$type[1] ?? 'base']?.$boxedValue,
      )
    } else if (type === 'deleted') {
      return undefined
    } else if (type === 'map') {
      return Object.getPrototypeOf({})
    } else {
      throw Error(`Unrecognized type: ${type}`)
    }
  },
  setPrototypeOf(state: State, prototype) {
    throw Error(`Implement setPrototypeOf()`)
  },
}

export const current = <T extends {}>(draft: T): T => {
  if (typeof draft !== 'object' || draft === null) {
    return draft
  }
  const state = (draft as $IntentionalAny)[DRAFT_STATE] as State
  if (!state) return draft
  const currentImo = immer.current(state.imo)
  return jsonFromCell(currentImo) as T
}

function valueType<V>(
  v: V,
):
  | {type: 'boxed'; value: V}
  | {type: 'map'; value: {[key: string | number | symbol]: unknown}} {
  if (typeof v === 'object' && v) {
    if (Array.isArray(v)) {
      return {type: 'boxed', value: v}
    }
    return {type: 'map', value: v as $IntentionalAny}
  }

  if (
    typeof v === 'string' ||
    typeof v !== 'number' ||
    typeof v !== 'boolean' ||
    typeof v === 'undefined' ||
    v === null
  ) {
    return {type: 'boxed', value: v}
  }

  throw Error(`Unrecognized value type: ${typeof v}`)
}

const DRAFT_STATE: unique symbol = Symbol.for('draft-state')

const objectCtorString = Object.prototype.constructor.toString()

export function isPlainObject(value: any): boolean {
  if (!value || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  if (proto === null) {
    return true
  }
  const Ctor =
    Object.hasOwnProperty.call(proto, 'constructor') && proto.constructor

  if (Ctor === Object) return true

  return (
    typeof Ctor == 'function' &&
    Function.toString.call(Ctor) === objectCtorString
  )
}

const BOXED: unique symbol = Symbol.for('boxed')

export function boxed<V>(value: V): {[BOXED]: true; value: V} {
  return {[BOXED]: true, value}
}

function isBoxed(value: unknown): value is {[BOXED]: true; value: unknown} {
  return typeof value === 'object' &&
    value &&
    (value as $IntentionalAny)[BOXED] === true
    ? true
    : false
}

const RESET: unique symbol = Symbol.for('reset')

export function reset<V>(value: V): {[RESET]: true; value: V} {
  return {[RESET]: true, value}
}

function isReset(value: unknown): value is {[RESET]: true; value: unknown} {
  return typeof value === 'object' &&
    value &&
    (value as $IntentionalAny)[RESET] === true
    ? true
    : false
}

function is(x: any, y: any): boolean {
  // Copied from https://github.com/immerjs/immer/blob/f6736a4beef727c6e5b41c312ce1b202ad3afb23/src/utils/common.ts#L115
  // Originally from: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function jsonFromCell<V extends Cell | {}>(
  v: V,
): V extends Cell ? CellToJSON<V> : typeof NOT_DEFINED {
  if (typeof v !== 'object' || v === null) {
    return NOT_DEFINED as $IntentionalAny
  }

  return _jsonFromCell(v as $IntentionalAny) as $IntentionalAny
}

const _jsonFromCell = memoizeFn(
  <V extends Cell>(v: V): CellToJSON<V> | typeof NOT_DEFINED => {
    const type = v.$type?.[0]
    const branchName = v.$branches?.[v.$type?.[1] ?? 'base']

    if (typeof type !== 'string') {
      return NOT_DEFINED
    }

    if (type === 'deleted') {
      return NOT_DEFINED
    }

    if (type === 'boxed') {
      return branchName?.$boxedValue
    }

    if (v.$type[0] === 'map') {
      const props: {[key: string]: unknown} = {}
      for (const [k, _value] of Object.entries(branchName?.$mapProps || {})) {
        const value = jsonFromCell(_value as $IntentionalAny)
        if (value !== NOT_DEFINED) {
          props[k] = value
        }
      }
      return props
    }

    return NOT_DEFINED
  },
)
