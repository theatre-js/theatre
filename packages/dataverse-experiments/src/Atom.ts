import get from 'lodash-es/get'
import isPlainObject from 'lodash-es/isPlainObject'
import last from 'lodash-es/last'
import DerivationFromSource from './derivations/DerivationFromSource'
import type {IDerivation} from './derivations/IDerivation'
import {isDerivation} from './derivations/IDerivation'
import type {Pointer, PointerType} from './pointer'
import pointer, {getPointerMeta} from './pointer'
import type {$FixMe, $IntentionalAny} from './types'
import type {PathBasedReducer} from './utils/PathBasedReducer'
import updateDeep from './utils/updateDeep'

type Listener = (newVal: unknown) => void

enum ValueTypes {
  Dict,
  Array,
  Other,
}

const getTypeOfValue = (v: unknown): ValueTypes => {
  if (Array.isArray(v)) return ValueTypes.Array
  if (isPlainObject(v)) return ValueTypes.Dict
  return ValueTypes.Other
}

const getKeyOfValue = (
  v: unknown,
  key: string | number,
  vType: ValueTypes = getTypeOfValue(v),
): unknown => {
  if (vType === ValueTypes.Dict && typeof key === 'string') {
    return (v as $IntentionalAny)[key]
  } else if (vType === ValueTypes.Array && isValidArrayIndex(key)) {
    return (v as $IntentionalAny)[key]
  } else {
    return undefined
  }
}

const isValidArrayIndex = (key: string | number): boolean => {
  const inNumber = typeof key === 'number' ? key : parseInt(key, 10)
  return (
    !isNaN(inNumber) &&
    inNumber >= 0 &&
    inNumber < Infinity &&
    (inNumber | 0) === inNumber
  )
}

class Scope {
  children: Map<string | number, Scope> = new Map()
  identityChangeListeners: Set<Listener> = new Set()
  constructor(
    readonly _parent: undefined | Scope,
    readonly _path: (string | number)[],
  ) {}

  addIdentityChangeListener(cb: Listener) {
    this.identityChangeListeners.add(cb)
  }

  removeIdentityChangeListener(cb: Listener) {
    this.identityChangeListeners.delete(cb)
    this._checkForGC()
  }

  removeChild(key: string | number) {
    this.children.delete(key)
    this._checkForGC()
  }

  getChild(key: string | number) {
    return this.children.get(key)
  }

  getOrCreateChild(key: string | number) {
    let child = this.children.get(key)
    if (!child) {
      child = child = new Scope(this, this._path.concat([key]))
      this.children.set(key, child)
    }
    return child
  }

  _checkForGC() {
    if (this.identityChangeListeners.size > 0) return
    if (this.children.size > 0) return

    if (this._parent) {
      this._parent.removeChild(last(this._path) as string | number)
    }
  }
}

export default class Atom<State extends {}> {
  private _currentState: State
  private readonly _rootScope: Scope
  readonly pointer: Pointer<State>

  constructor(initialState: State) {
    this._currentState = initialState
    this._rootScope = new Scope(undefined, [])
    this.pointer = pointer({root: this as $FixMe, path: []})
  }

  setState(newState: State) {
    const oldState = this._currentState
    this._currentState = newState

    this._checkUpdates(this._rootScope, oldState, newState)
  }

  getState() {
    return this._currentState
  }

  getIn(path: (string | number)[]): unknown {
    return path.length === 0 ? this.getState() : get(this.getState(), path)
  }

  reduceState: PathBasedReducer<State, State> = (
    path: $IntentionalAny[],
    reducer: $IntentionalAny,
  ) => {
    const newState = updateDeep(this.getState(), path, reducer)
    this.setState(newState)
    return newState
  }

  setIn(path: $FixMe[], val: $FixMe) {
    return this.reduceState(path, () => val)
  }

  private _checkUpdates(scope: Scope, oldState: unknown, newState: unknown) {
    if (oldState === newState) return
    scope.identityChangeListeners.forEach((cb) => cb(newState))

    if (scope.children.size === 0) return
    const oldValueType = getTypeOfValue(oldState)
    const newValueType = getTypeOfValue(newState)

    if (oldValueType === ValueTypes.Other && oldValueType === newValueType)
      return

    scope.children.forEach((childScope, childKey) => {
      const oldChildVal = getKeyOfValue(oldState, childKey, oldValueType)
      const newChildVal = getKeyOfValue(newState, childKey, newValueType)
      this._checkUpdates(childScope, oldChildVal, newChildVal)
    })
  }

  private _getOrCreateScopeForPath(path: (string | number)[]): Scope {
    let curScope = this._rootScope
    for (const pathEl of path) {
      curScope = curScope.getOrCreateChild(pathEl)
    }
    return curScope
  }

  onPathValueChange(path: (string | number)[], cb: (v: unknown) => void) {
    const scope = this._getOrCreateScopeForPath(path)
    scope.identityChangeListeners.add(cb)
    const untap = () => {
      scope.identityChangeListeners.delete(cb)
    }
    return untap
  }
}

const identityDerivationWeakMap = new WeakMap<{}, IDerivation<unknown>>()

export const valueDerivation = <P extends PointerType<$IntentionalAny>>(
  pointer: P,
): IDerivation<P extends PointerType<infer T> ? T : void> => {
  const meta = getPointerMeta(pointer)

  let pr = identityDerivationWeakMap.get(meta)
  if (!pr) {
    const root = meta.root
    if (!(root instanceof Atom)) {
      throw new Error(
        `Cannot run valueDerivation on a pointer whose root is not an Atom`,
      )
    }
    const {path} = meta
    pr = new DerivationFromSource<$IntentionalAny>(
      (listener) => root.onPathValueChange(path, listener),
      () => root.getIn(path),
    )
    identityDerivationWeakMap.set(meta, pr)
  }
  return pr as $IntentionalAny
}

export const val = <P>(
  pointerOrDerivationOrPlainValue: P,
): P extends PointerType<infer T>
  ? T
  : P extends IDerivation<infer T>
  ? T
  : unknown => {
  if (isPointer(pointerOrDerivationOrPlainValue)) {
    return valueDerivation(
      pointerOrDerivationOrPlainValue,
    ).getValue() as $IntentionalAny
  } else if (isDerivation(pointerOrDerivationOrPlainValue)) {
    return pointerOrDerivationOrPlainValue.getValue() as $IntentionalAny
  } else {
    return pointerOrDerivationOrPlainValue as $IntentionalAny
  }
}

export const isPointer = (p: $IntentionalAny): p is Pointer<unknown> => {
  return p && p.$pointerMeta ? true : false
}
