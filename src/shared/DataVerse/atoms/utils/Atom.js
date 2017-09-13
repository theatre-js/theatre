// @flow
// import {type DeepDiff} from '$shared/DataVerse/types'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'

export interface IAtom {
  isAtom: true,
  +unboxDeep: () => mixed,
  _setParent(p: IAtom): void,
  _unsetParent(): void,
  changes(): Tappable<*>, // shallow changes. Does not include what's removed
  deepChanges(): Tappable<*>, // deep changes. Includes an address
  deepDiffs(): Tappable<*>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  isAtom: true,
}

export default class Atom implements IAtom {
  isAtom = true
  isAtom = true
  _changeEmitter: Emitter<*>
  _deepChangeEmitter: Emitter<*>
  _deepDiffEmitter: Emitter<*>
  _parent: ?IAtom
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

  _setParent(p: IAtom) {
    if (this._parent)
      throw new Error(`This Atom already does have a parent`)

    this._parent = p
  }

  _unsetParent() {
    if (!this._parent) {
      throw new Error(`This Atom does not have a parrent`)
    }

    this._parent = undefined
  }
}