import {IdentityDerivation} from '$shared/DataVerse/identityDerivation'
import {
  get,
  last,
  isPlainObject,
  updateImmutable as update,
} from '$shared/utils'
import pointer, {Pointer, PointerInnerObj} from './pointer'
import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'
import AbstractDerivation, {
  isDerivation,
} from '$shared/DataVerse/derivations/AbstractDerivation'

type Listener = (newVal: mixed) => void

enum ValueTypes {
  Dict,
  Array,
  Other,
}

const getTypeOfValue = (v: mixed): ValueTypes => {
  if (Array.isArray(v)) return ValueTypes.Array
  if (isPlainObject(v)) return ValueTypes.Dict
  return ValueTypes.Other
}

const getKeyOfValue = (
  v: mixed,
  key: string | number,
  vType: ValueTypes = getTypeOfValue(v),
): mixed => {
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

class Thingy {
  children: Map<string | number, Thingy> = new Map()
  identityChangeListeners: Set<Listener> = new Set()
  constructor(
    readonly _parent: undefined | Thingy,
    readonly _path: Array<string | number>,
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
      child = child = new Thingy(this, this._path.concat([key]))
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

export interface Pointable {
  _getIdentityByPath(path: Array<string | number>): mixed
  _tapIntoIdentityOfPathChanges(
    path: Array<string | number>,
    cb: (v: mixed) => void,
  ): void
}

export class Atom<State> implements Pointable {
  _currentState: State
  readonly _rootThingy: Thingy
  readonly pointer: Pointer<State>

  constructor(initialState: State) {
    this._currentState = initialState
    this._rootThingy = new Thingy(undefined, [])
    this.pointer = pointer({root: this, path: []})
  }

  setState(newState: State) {
    const oldState = this._currentState
    this._currentState = newState

    this._comp([], this._rootThingy, oldState, newState)
  }

  getState() {
    return this._currentState
  }

  getIn(path: string[]) {
    return path.length === 0 ? this.getState() : get(this.getState(), path)
  }

  reduceState: PathBasedReducer<State, State> = (
    path: $IntentionalAny[],
    reducer: $IntentionalAny,
  ) => {
    const newState = update(path, reducer, this.getState())
    this.setState(newState)
    return newState
  }

  _comp(
    path: Array<string | number>,
    thingy: Thingy,
    oldState: mixed,
    newState: mixed,
  ) {
    if (oldState === newState) return
    // if (path.includes('points') && window.dbg) debugger
    thingy.identityChangeListeners.forEach(cb => cb(newState))

    if (thingy.children.size === 0) return
    const oldValueType = getTypeOfValue(oldState)
    const newValueType = getTypeOfValue(newState)

    if (oldValueType === ValueTypes.Other && oldValueType === newValueType)
      return

    thingy.children.forEach((childThingy, childKey) => {
      const oldChildVal = getKeyOfValue(oldState, childKey, oldValueType)
      const newChildVal = getKeyOfValue(newState, childKey, newValueType)
      this._comp([...path, childKey], childThingy, oldChildVal, newChildVal)
    })
  }

  getValueByPath(path: Array<string | number>): $IntentionalAny {
    return get(this._currentState, path)
  }

  _getOrCreateThingyForPath(path: Array<string | number>) {
    let curThingy = this._rootThingy
    for (const pathEl of path) {
      curThingy = curThingy.getOrCreateChild(pathEl)
    }
    return curThingy
  }

  _getThingyForPath(path: Array<string | number>): Thingy | undefined {
    let curThingy = this._rootThingy
    for (const pathEl of path) {
      const child = curThingy.getChild(pathEl)
      if (!child) {
        return undefined
      }

      curThingy = child
    }
    return curThingy
  }

  _getIdentityByPath(path: Array<string | number>): mixed {
    return path.length === 0
      ? this._currentState
      : get(this._currentState, path)
  }

  _tapIntoIdentityOfPathChanges(
    path: Array<string | number>,
    cb: (v: mixed) => void,
  ) {
    const thingy = this._getOrCreateThingyForPath(path)
    thingy.identityChangeListeners.add(cb)
    const untap = () => {
      thingy.identityChangeListeners.delete(cb)
    }
    return untap
  }
}

const atom = <D extends {}>(data: D) => new Atom<D>(data)

export default atom

export const valueDerivation = <P extends PointerInnerObj<$IntentionalAny>>(
  pointer: P,
): IdentityDerivation<P extends PointerInnerObj<infer T> ? T : void> => {
  const meta = pointer.$pointerMeta
  let derivation = meta.identityDerivation
  if (!derivation) {
    derivation = meta.identityDerivation = new IdentityDerivation<
      $IntentionalAny
    >(meta.root, meta.path)
  }
  return derivation as $IntentionalAny
}

export const val = <P>(
  pointerOrDerivationOrPlainValue: P,
): P extends PointerInnerObj<infer T>
  ? T
  : P extends AbstractDerivation<infer T>
  ? T
  : P => {
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

export const isPointer = (p: $IntentionalAny): p is Pointer<mixed> => {
  return p && p.$pointerMeta ? true : false
}

/**
 * Like val(), but used for a one-off read
 */
export const coldVal = <P>(
  pointerOrDerivationOrPlainValue: P,
): P extends PointerInnerObj<infer T>
  ? T
  : P extends AbstractDerivation<infer T>
  ? T
  : P => {
  if (isPointer(pointerOrDerivationOrPlainValue)) {
    const meta = pointerOrDerivationOrPlainValue.$pointerMeta
    return meta.root.getIn(meta.path as $IntentionalAny)
  } else if (isDerivation(pointerOrDerivationOrPlainValue)) {
    return pointerOrDerivationOrPlainValue.getValueCold() as $IntentionalAny
  } else {
    return pointerOrDerivationOrPlainValue as $IntentionalAny
  }
}

export const pathTo = <P extends PointerInnerObj<$IntentionalAny>>(
  pointer: P,
): Array<string | number> => {
  const meta = pointer.$pointerMeta
  return meta.path
}
