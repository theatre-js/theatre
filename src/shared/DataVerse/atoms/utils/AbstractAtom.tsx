import {MapKey} from '$shared/DataVerse/types'
import Emitter from '$shared/DataVerse/utils/Emitter'
import AbstractCompositeAtom from './AbstractCompositeAtom'

export default abstract class AbstractAtom<ChangeType> {
  isAtom = true
  _trace: $FixMe
  _changeEmitter: Emitter<ChangeType>
  _parent: null | {atom: AbstractCompositeAtom<$IntentionalAny>, key: MapKey}
  abstract unboxDeep(): mixed

  constructor() {
    if (process.env.KEEPING_DERIVATION_TRACES === true) {
      this._trace = new Error('trace')
    }
    this._changeEmitter = new Emitter()
    this._parent = null
  }

  changes() {
    return this._changeEmitter.tappable
  }

  _setParent(p: AbstractCompositeAtom<$IntentionalAny>, key: MapKey) {
    if (this._parent) throw new Error(`This Atom already does have a parent`)

    this._parent = {atom: p, key}
  }

  _unsetParent() {
    if (!this._parent) {
      throw new Error(`This Atom does not have a parrent`)
    }

    this._parent = null
  }

  getParent() {
    if (this._parent) {
      return this._parent.atom
    } else {
      return null
    }
  }
}
