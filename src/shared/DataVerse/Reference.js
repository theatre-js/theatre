// @flow
import AbstractReference from './utils/AbstractReference'

export default class Reference<V> extends AbstractReference {
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
    if (this.events.hasListenersFor('diff')) {
      const oldValue = this.get()
      const newValue = value
      diff = {address: [], oldValue, newValue}
    }

    this._value = value

    if (diff) this.events.emit('diff', diff)

    return this
  }

  get(): V {
    return this._value
  }
}