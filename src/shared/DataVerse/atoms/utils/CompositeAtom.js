// @flow
import {default as Atom, type IAtom} from './Atom'

export interface ICompositeAtom extends IAtom {
  isCompositeAtom: true,
  _adopt(key: string | number, value: IAtom): void,
  _unadopt(key: string | number, value: IAtom): void,
}

export default class CompositeAtom extends Atom implements ICompositeAtom {
  isCompositeAtom = true
  _deepChangeUntappersForEachChild: *

  constructor() {
    super()
    this._deepChangeUntappersForEachChild = new Map()
  }

  _adopt(key: string | number, ref: IAtom) {
    ref._setParent(this)

    this._deepChangeUntappersForEachChild.set(key, ref.deepChanges().tap((change) => {
      this._deepChangeEmitter.emit({...change, address: [key, ...change.address]})
    }))

  }

  _unadopt(key: string | number, value: IAtom) {
    value._unsetParent()
    // $FlowIgnore
    this._deepChangeUntappersForEachChild.get(key)()
    this._deepChangeUntappersForEachChild.delete(key)
  }
}