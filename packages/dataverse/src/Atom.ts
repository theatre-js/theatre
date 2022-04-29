import get from 'lodash-es/get'
import isPlainObject from 'lodash-es/isPlainObject'
import last from 'lodash-es/last'
import DerivationFromSource from './derivations/DerivationFromSource'
import type {IDerivation} from './derivations/IDerivation'
import {isDerivation} from './derivations/IDerivation'
import type {Pointer, PointerType} from './pointer'
import {isPointer} from './pointer'
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

/**
 * Interface for objects that can provide a derivation at a certain path.
 */
export interface IdentityDerivationProvider {
  /**
   * @internal
   * Future: We could consider using a `Symbol.for("dataverse/IdentityDerivationProvider")` as a key here, similar to
   * how {@link Iterable} works for `of`.
   */
  readonly $$isIdentityDerivationProvider: true
  /**
   * Returns a derivation of the value at the provided path.
   *
   * @param path - The path to create the derivation at.
   */
  getIdentityDerivation(path: Array<string | number>): IDerivation<unknown>
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
export default class Atom<State extends {}>
  implements IdentityDerivationProvider
{
  private _currentState: State
  /**
   * @internal
   */
  readonly $$isIdentityDerivationProvider = true
  private readonly _rootScope: Scope
  /**
   * Convenience property that gives you a pointer to the root of the atom.
   *
   * @remarks
   * Equivalent to `pointer({ root: thisAtom, path: [] })`.
   */
  readonly pointer: Pointer<State>

  constructor(initialState: State) {
    this._currentState = initialState
    this._rootScope = new Scope(undefined, [])
    this.pointer = pointer({root: this as $FixMe, path: []})
  }

  /**
   * Sets the state of the atom.
   *
   * @param newState - The new state of the atom.
   */
  setState(newState: State) {
    const oldState = this._currentState
    this._currentState = newState

    this._checkUpdates(this._rootScope, oldState, newState)
  }

  /**
   * Gets the current state of the atom.
   */
  getState() {
    return this._currentState
  }

  /**
   * Gets the state of the atom at `path`.
   */
  getIn(path: (string | number)[]): unknown {
    return path.length === 0 ? this.getState() : get(this.getState(), path)
  }

  /**
   * Creates a new state object from the current one, where the value at `path`
   * is replaced by the return value of `reducer`, then sets it.
   *
   * @remarks
   * Doesn't mutate the old state, and preserves referential equality between
   * values of the old state and the new state where possible.
   *
   * @example
   * ```ts
   * someAtom.getIn(['a']) // 1
   * someAtom.reduceState(['a'], (state) => state + 1);
   * someAtom.getIn(['a']) // 2
   * ```
   *
   * @param path - The path to call the reducer at.
   * @param reducer - The function to use for creating the new state.
   */
  // TODO: Why is this a property and not a method?
  reduceState: PathBasedReducer<State, State> = (
    path: $IntentionalAny[],
    reducer: $IntentionalAny,
  ) => {
    const newState = updateDeep(this.getState(), path, reducer)
    this.setState(newState)
    return newState
  }

  /**
   * Sets the state of the atom at `path`.
   */
  setIn(path: $FixMe[], val: $FixMe) {
    return this.reduceState(path, () => val)
  }

  private _checkUpdates(scope: Scope, oldState: unknown, newState: unknown) {
    if (oldState === newState) return
    scope.identityChangeListeners.forEach((cb) => cb(newState))

    if (scope.children.size === 0) return

    // @todo we can probably skip checking value types
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
   * Returns a new derivation of the value at the provided path.
   *
   * @param path - The path to create the derivation at.
   */
  getIdentityDerivation(path: Array<string | number>): IDerivation<unknown> {
    return new DerivationFromSource<$IntentionalAny>(
      (listener) => this._onPathValueChange(path, listener),
      () => this.getIn(path),
    )
  }
}

const identityDerivationWeakMap = new WeakMap<{}, IDerivation<unknown>>()

/**
 * Returns a derivation of the value at the provided pointer. Derivations are
 * cached per pointer.
 *
 * @param pointer - The pointer to return the derivation at.
 */
export const valueDerivation = <P extends PointerType<$IntentionalAny>>(
  pointer: P,
): IDerivation<P extends PointerType<infer T> ? T : void> => {
  const meta = getPointerMeta(pointer)

  let derivation = identityDerivationWeakMap.get(meta)
  if (!derivation) {
    const root = meta.root
    if (!isIdentityDerivationProvider(root)) {
      throw new Error(
        `Cannot run valueDerivation() on a pointer whose root is not an IdentityChangeProvider`,
      )
    }
    const {path} = meta
    derivation = root.getIdentityDerivation(path)
    identityDerivationWeakMap.set(meta, derivation)
  }
  return derivation as $IntentionalAny
}

function isIdentityDerivationProvider(
  val: unknown,
): val is IdentityDerivationProvider {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as $IntentionalAny)['$$isIdentityDerivationProvider'] === true
  )
}

/**
 * Convenience function that returns a plain value from its argument, whether it
 * is a pointer, a derivation or a plain value itself.
 *
 * @remarks
 * For pointers, the value is returned by first creating a derivation, so it is
 * reactive e.g. when used in a `prism`.
 *
 * @param input - The argument to return a value from.
 */
export const val = <
  P extends
    | PointerType<$IntentionalAny>
    | IDerivation<$IntentionalAny>
    | undefined
    | null,
>(
  input: P,
): P extends PointerType<infer T>
  ? T
  : P extends IDerivation<infer T>
  ? T
  : P extends undefined | null
  ? P
  : unknown => {
  if (isPointer(input)) {
    return valueDerivation(input).getValue() as $IntentionalAny
  } else if (isDerivation(input)) {
    return input.getValue() as $IntentionalAny
  } else {
    return input as $IntentionalAny
  }
}
