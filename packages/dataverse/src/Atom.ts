import get from 'lodash-es/get'
import isPlainObject from 'lodash-es/isPlainObject'
import last from 'lodash-es/last'
import type {Prism} from './prism/Interface'
import type {Pointer} from './pointer'
import {getPointerParts} from './pointer'
import {isPointer} from './pointer'
import pointer from './pointer'
import type {$FixMe, $IntentionalAny} from './types'
import updateDeep from './utils/updateDeep'
import prism from './prism/prism'
import type {PointerToPrismProvider} from './pointerToPrism'

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

  /**
   * Returns the current state of the atom.
   */
  get(): State {
    return this._currentState
  }

  /**
   * Returns the value at the given pointer
   *
   * @param pointerOrFn - A pointer to the desired path. Could also be a function returning a pointer
   *
   * Example
   * ```ts
   * const atom = atom({ a: { b: 1 } })
   * atom.getByPointer(atom.pointer.a.b) // 1
   * atom.getByPointer((p) => p.a.b) // 1
   * ```
   */
  getByPointer<S>(
    pointerOrFn: Pointer<S> | ((p: Pointer<State>) => Pointer<S>),
  ): S {
    const pointer = isPointer(pointerOrFn)
      ? pointerOrFn
      : (pointerOrFn as $IntentionalAny)(this.pointer)

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

  /**
   * Reduces the value at the given pointer
   *
   * @param pointerOrFn - A pointer to the desired path. Could also be a function returning a pointer
   *
   * Example
   * ```ts
   * const atom = atom({ a: { b: 1 } })
   * atom.reduceByPointer(atom.pointer.a.b, (b) => b + 1) // atom.get().a.b === 2
   * atom.reduceByPointer((p) => p.a.b, (b) => b + 1) // atom.get().a.b === 2
   * ```
   */
  reduceByPointer<S>(
    pointerOrFn: Pointer<S> | ((p: Pointer<State>) => Pointer<S>),
    reducer: (s: S) => S,
  ) {
    const pointer = isPointer(pointerOrFn)
      ? pointerOrFn
      : (pointerOrFn as $IntentionalAny)(this.pointer)

    const path = getPointerParts(pointer).path
    const newState = updateDeep(this.get(), path, reducer)
    this.set(newState)
  }

  /**
   * Sets the value at the given pointer
   *
   * @param pointerOrFn - A pointer to the desired path. Could also be a function returning a pointer
   *
   * Example
   * ```ts
   * const atom = atom({ a: { b: 1 } })
   * atom.setByPointer(atom.pointer.a.b, 2) // atom.get().a.b === 2
   * atom.setByPointer((p) => p.a.b, 2) // atom.get().a.b === 2
   * ```
   */
  setByPointer<S>(
    pointerOrFn: Pointer<S> | ((p: Pointer<State>) => Pointer<S>),
    val: S,
  ) {
    this.reduceByPointer(pointerOrFn, () => val)
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

  /**
   * Adds a listener that will be called whenever the value at the given pointer changes.
   * @param pointer - The pointer to listen to
   * @param cb - The callback to call when the value changes
   * @returns A function that can be called to unsubscribe from the listener
   *
   * **NOTE** Unlike {@link prism}s, `onChangeByPointer` and `onChange()` are traditional event listeners. They don't
   * provide any of the benefits of prisms. They don't compose, they can't be coordinated via a Ticker, their derivations
   * aren't cached, etc. You're almost always better off using a prism (which will internally use `onChangeByPointer`).
   *
   * ```ts
   * const a = atom({foo: 1})
   * const unsubscribe = a.onChangeByPointer(a.pointer.foo, (v) => {
   *  console.log('foo changed to', v)
   * })
   * a.setByPointer(a.pointer.foo, 2) // logs 'foo changed to 2'
   * a.set({foo: 3}) // logs 'foo changed to 3'
   * unsubscribe()
   * ```
   */
  onChangeByPointer = <S>(
    pointerOrFn: Pointer<S> | ((p: Pointer<State>) => Pointer<S>),
    cb: (v: S) => void,
  ): (() => void) => {
    const pointer = isPointer(pointerOrFn)
      ? pointerOrFn
      : (pointerOrFn as $IntentionalAny)(this.pointer)
    const {path} = getPointerParts(pointer)
    const scope = this._getOrCreateScopeForPath(path)
    scope.identityChangeListeners.add(cb as $IntentionalAny)
    const unsubscribe = () => {
      scope.identityChangeListeners.delete(cb as $IntentionalAny)
    }
    return unsubscribe
  }

  /**
   * Adds a listener that will be called whenever the state of the atom changes.
   * @param cb - The callback to call when the value changes
   * @returns A function that can be called to unsubscribe from the listener
   *
   * **NOTE** Unlike {@link prism}s, `onChangeByPointer` and `onChange()` are traditional event listeners. They don't
   * provide any of the benefits of prisms. They don't compose, they can't be coordinated via a Ticker, their derivations
   * aren't cached, etc. You're almost always better off using a prism (which will internally use `onChangeByPointer`).
   *
   * ```ts
   * const a = atom({foo: 1})
   * const unsubscribe = a.onChange((v) => {
   * console.log('a changed to', v)
   * })
   * a.set({foo: 3}) // logs 'a changed to {foo: 3}'
   * unsubscribe()
   * ```
   */
  onChange(cb: (v: State) => void): () => void {
    return this.onChangeByPointer(this.pointer, cb)
  }

  /**
   * Returns a new prism of the value at the provided path.
   *
   * @param pointer - The path to create the prism at.
   *
   * ```ts
   * const pr = atom({ a: { b: 1 } }).pointerToPrism(atom.pointer.a.b)
   * pr.getValue() // 1
   * ```
   */
  pointerToPrism<P>(pointer: Pointer<P>): Prism<P> {
    const {path} = getPointerParts(pointer)
    const subscribe = (listener: (val: unknown) => void) =>
      this.onChangeByPointer(pointer, listener)

    const getValue = () => this._getIn(path)

    return prism(() => {
      return prism.source(subscribe, getValue)
    }) as Prism<P>
  }
}
