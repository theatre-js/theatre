
import type {MapKey, True} from '$shared/DataVerse/types'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import type {ICompositeAtom} from './AbstractCompositeAtom'
// import type {IPointer} from '$shared/DataVerse/derivations/pointer'

export type IAtom = {
  isAtom: True,
  unboxDeep: () => mixed,
  _setParent(p: ICompositeAtom, key: MapKey): void,
  _unsetParent(): void,
  changes(): Tappable<$IntentionalAny>, // shallow changes. Does not include what's removed
  deepChanges(): Tappable<$IntentionalAny>, // deep changes. Includes an address
  deepDiffs(): Tappable<$IntentionalAny>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  getParent(): ?ICompositeAtom,
}

interface _IAtom {
  // isAtom: True,
  // +unboxDeep: () => mixed,
  // _setParent(p: ICompositeAtom, key: MapKey): void,
  // _unsetParent(): void,
  // changes(): Tappable<$IntentionalAny>, // shallow changes. Does not include what's removed
  // deepChanges(): Tappable<$IntentionalAny>, // deep changes. Includes an address
  // deepDiffs(): Tappable<$IntentionalAny>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  // getAddress(): Address,
  // getParent(): ?ICompositeAtom,
}

export default class AbstractAtom implements _IAtom {
  isAtom = 'True'
  _changeEmitter: *
  _deepChangeEmitter: *
  _deepDiffEmitter: *
  _parent: $FixMe
  // _parent: ?{atom: ICompositeAtom, key: MapKey}
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

  _setParent(p: ICompositeAtom, key: MapKey) {
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
}

const pointer = require('$shared/DataVerse/derivations/pointer')