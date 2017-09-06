
import forEach from 'lodash/forEach'
import {type Atom} from '../index'

type AllowedKeyTypes = string | number
type AllowedValueTypes = string | number

export default class MapAtom<K: AllowedKeyTypes, V: AllowedValueTypes, O: {[key: K]: V}> implements Atom {
  __isAtom = true
  _map: Map<any, any>
  _parent: ?Atom

  constructor(o: O) {
    this._parent = undefined
    this._map = new Map()
    forEach(o, (val, key) => {
      this._map.set(key, val)
      val.setAtom(this)
    })
  }

  set(key: K, value: V): this {
    this._map.set(key, value)
    return this
  }

  get<KT: $Keys<O>, VT: $ElementType<O, KT>>(key: KT): VT {
    return (this._map.get(key): $IntentionalAny)
  }

  has(key: K): boolean {
    return this._map.has(key)
  }

  // getWithPlaceholder(key: K) {
  //   if (this.has(key)) {
  //     return this.get(key)
  //   } else {
  //     const placeholder = new PlaceHolder(this, key)
  //   }
  // }

  __setParent(parent: Atom) {
    if (this._parent) {
      throw new Error(`This atom already has a parent`)
    } else {
      this._parent = parent
    }
  }
}