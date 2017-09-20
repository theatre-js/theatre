// @flow
import type {Address, IReactive} from '$shared/DataVerse/types'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import type {ICompositeAtom} from './CompositeAtom'

export interface IAtom extends IReactive {
  isAtom: true,
  +unboxDeep: () => mixed,
  _setParent(p: ICompositeAtom, key: number | string): void,
  _unsetParent(): void,
  changes(): Tappable<$IntentionalAny>, // shallow changes. Does not include what's removed
  deepChanges(): Tappable<$IntentionalAny>, // deep changes. Includes an address
  deepDiffs(): Tappable<$IntentionalAny>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  isAtom: true,
  getAddress(): Address,
  getParent(): ?ICompositeAtom,
}

export default class Atom implements IAtom {
  isAtom = true
  _changeEmitter: Emitter<*>
  _deepChangeEmitter: Emitter<*>
  _deepDiffEmitter: Emitter<*>
  _parent: ?{atom: ICompositeAtom, key: string | number}
  +unboxDeep: () => mixed

  constructor() {
    this._deepChangeEmitter = new Emitter()
    this._changeEmitter = new Emitter()
    this._deepDiffEmitter = new Emitter()
    this._parent = null
  }

  changes() {
    return this._changeEmitter.tappable
  }

  deepChanges() {
    return this._deepChangeEmitter.tappable
  }

  deepDiffs() {
    return this._deepDiffEmitter.tappable
  }

  _setParent(p: ICompositeAtom, key: string | number) {
    if (this._parent)
      throw new Error(`This Atom already does have a parent`)

    this._parent = {atom: p, key}
  }

  _unsetParent() {
    if (!this._parent) {
      throw new Error(`This Atom does not have a parrent`)
    }

    this._parent = undefined
  }

  getParent() {
    if (this._parent) {
      return this._parent.atom
    }
  }

  getAddress() {
    if (!this._parent) {
      return {root: this, path: []}
    } else {
      return this._parent.atom.getAddressTo([this._parent.key])
    }
  }

  pointer() {
    return new Pointer.default(this.getAddress())
  }
}

const Pointer = require('$shared/DataVerse/utils/Pointer')