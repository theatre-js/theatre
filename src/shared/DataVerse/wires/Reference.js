// @flow
import {default as AbstractReference, type IAbstractReference} from './utils/AbstractReference'

export interface IReference<V> extends IAbstractReference {
  isSingleReference: true,
  unboxDeep(): V,
  set(v: V): IReference<V>,
  get(): V,
}

export default class Reference<V> extends AbstractReference implements IReference<V> {
  isSingleReference = true
  _value: V

  constructor(v: V) {
    super()
    this._value = v
  }

  unboxDeep(): V {
    return this._value
  }

  set(value: V): Reference<V> {
    let diff
    if (this._diffEmitter.hasTappers()) {
      const oldValue = this.get()
      const newValue = value
      diff = {address: [], oldValue, newValue}
    }

    this._value = value

    if (diff) this._diffEmitter.emit(diff)

    return this
  }

  get(): V {
    return this._value
  }
}