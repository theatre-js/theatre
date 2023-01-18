import get from 'lodash-es/get'
import isPlainObject from 'lodash-es/isPlainObject'
import last from 'lodash-es/last'
import type {Prism} from './prism/Interface'
import {isPrism} from './prism/Interface'
import type {Pointer, PointerType} from './pointer'
import {getPointerParts} from './pointer'
import {isPointer} from './pointer'
import pointer, {getPointerMeta} from './pointer'
import type {$FixMe, $IntentionalAny} from './types'
import updateDeep from './utils/updateDeep'
import prism from './prism/prism'

type Listener = (newVal: unknown) => void

enum ValueTypes {
  Dict,
  Array,
  Other,
}

/**
 * Interface for objects that can provide a prism at a certain path.
 */
export interface PointerToPrismProvider {
  /**
   * @internal
   * Future: We could consider using a `Symbol.for("dataverse/PointerToPrismProvider")` as a key here, similar to
   * how {@link Iterable} works for `of`.
   */
  readonly $$isPointerToPrismProvider: true
  /**
   * Returns a prism of the value at the provided path.
   */
  pointerToPrism<P>(pointer: Pointer<P>): Prism<P>
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

/**
 * Wraps an object whose (sub)properties can be individually tracked.
 */
export default class Atom<State> implements PointerToPrismProvider {
  private _currentState: State
  /**
   * @internal
   */
  readonly $$isPointerToPrismProvider = true
  private readonly _rootScope: Scope
  /**
   * Convenience property that gives you a pointer to the root of the atom.
   *
   * @remarks
   * Equivalent to `pointer({ root: thisAtom, path: [] })`.
   */
  readonly pointer: Pointer<State> = pointer({root: this as $FixMe, path: []})

  readonly prism: Prism<State> = this.pointerToPrism(
    this.pointer,
  ) as $IntentionalAny

  constructor(initialState: State) {
    this._currentState = initialState
    this._rootScope = new Scope(undefined, [])
  }

  /**
   * Sets the state of the atom.
   *
   * @param newState - The new state of the atom.
   */
  set(newState: State) {
    const oldState = this._currentState
    this._currentState = newState

    this._checkUpdates(this._rootScope, oldState, newState)
  }

  get(): State {
    return this._currentState
  }

  getByPointer<S>(fn: (p: Pointer<State>) => Pointer<S>): S {
    const pointer = fn(this.pointer)
    const path = getPointerParts(pointer).path
    return this._getIn(path) as S
  }

  /**
   * Gets the state of the atom at `path`.
   */
  private _getIn(path: (string | number)[]): unknown {
    return path.length === 0 ? this.get() : get(this.get(), path)
  }

  reduce(fn: (state: State) => State) {
    this.set(fn(this.get()))
  }

  reduceByPointer<S>(
    fn: (p: Pointer<State>) => Pointer<S>,
    reducer: (s: S) => S,
  ) {
    const pointer = fn(this.pointer)
    const path = getPointerParts(pointer).path
    const newState = updateDeep(this.get(), path, reducer)
    this.set(newState)
  }

  setByPointer<S>(fn: (p: Pointer<State>) => Pointer<S>, val: S) {
    this.reduceByPointer(fn, () => val)
  }

  private _checkUpdates(scope: Scope, oldState: unknown, newState: unknown) {
    if (oldState === newState) return
    for (const cb of scope.identityChangeListeners) {
      cb(newState)
    }

    if (scope.children.size === 0) return

    // @todo we can probably skip checking value types
    const oldValueType = getTypeOfValue(oldState)
    const newValueType = getTypeOfValue(newState)

    if (oldValueType === ValueTypes.Other && oldValueType === newValueType)
      return

    for (const [childKey, childScope] of scope.children) {
      const oldChildVal = getKeyOfValue(oldState, childKey, oldValueType)
      const newChildVal = getKeyOfValue(newState, childKey, newValueType)
      this._checkUpdates(childScope, oldChildVal, newChildVal)
    }
  }

  private _getOrCreateScopeForPath(path: (string | number)[]): Scope {
    let curScope = this._rootScope
    for (const pathEl of path) {
      curScope = curScope.getOrCreateChild(pathEl)
    }
    return curScope
  }

  private _onPathValueChange = (
    path: (string | number)[],
    cb: (v: unknown) => void,
  ) => {
    const scope = this._getOrCreateScopeForPath(path)
    scope.identityChangeListeners.add(cb)
    const untap = () => {
      scope.identityChangeListeners.delete(cb)
    }
    return untap
  }

  /**
   * Returns a new prism of the value at the provided path.
   *
   * @param path - The path to create the prism at.
   */
  pointerToPrism<P>(pointer: Pointer<P>): Prism<P> {
    const {path} = getPointerParts(pointer)
    const subscribe = (listener: (val: unknown) => void) =>
      this._onPathValueChange(path, listener)

    const getValue = () => this._getIn(path)

    return prism(() => {
      return prism.source(subscribe, getValue)
    }) as Prism<P>
  }
}

const identifyPrismWeakMap = new WeakMap<{}, Prism<unknown>>()

/**
 * Returns a prism of the value at the provided pointer. Prisms are
 * cached per pointer.
 *
 * @param pointer - The pointer to return the prism at.
 */
export const pointerToPrism = <P extends PointerType<$IntentionalAny>>(
  pointer: P,
): Prism<P extends PointerType<infer T> ? T : void> => {
  const meta = getPointerMeta(pointer)

  let prismInstance = identifyPrismWeakMap.get(meta)
  if (!prismInstance) {
    const root = meta.root
    if (!isPointerToPrismProvider(root)) {
      throw new Error(
        `Cannot run pointerToPrism() on a pointer whose root is not an PointerToPrismProvider`,
      )
    }
    prismInstance = root.pointerToPrism(pointer as $IntentionalAny)
    identifyPrismWeakMap.set(meta, prismInstance)
  }
  return prismInstance as $IntentionalAny
}

function isPointerToPrismProvider(val: unknown): val is PointerToPrismProvider {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as $IntentionalAny)['$$isPointerToPrismProvider'] === true
  )
}

/**
 * Convenience function that returns a plain value from its argument, whether it
 * is a pointer, a prism or a plain value itself.
 *
 * @remarks
 * For pointers, the value is returned by first creating a prism, so it is
 * reactive e.g. when used in a `prism`.
 *
 * @param input - The argument to return a value from.
 */
export const val = <
  P extends
    | PointerType<$IntentionalAny>
    | Prism<$IntentionalAny>
    | undefined
    | null,
>(
  input: P,
): P extends PointerType<infer T>
  ? T
  : P extends Prism<infer T>
  ? T
  : P extends undefined | null
  ? P
  : unknown => {
  if (isPointer(input)) {
    return pointerToPrism(input).getValue() as $IntentionalAny
  } else if (isPrism(input)) {
    return input.getValue() as $IntentionalAny
  } else {
    return input as $IntentionalAny
  }
}
