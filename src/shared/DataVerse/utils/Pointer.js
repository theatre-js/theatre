// @flow
import type {Address} from '$shared/DataVerse/types'

export default class Pointer {
  static NOTFOUND = Symbol('notfound')
  _address: Address
  constructor(address: Address) {
    this._address = address
  }

  prop(key: string | number) {
    return new Pointer({...this._address, path: [...this._address.path, key]})
  }

  index(key: number) {
    return new Pointer({...this._address, path: [...this._address.path, key]})
  }

  derivation() {

  }
}