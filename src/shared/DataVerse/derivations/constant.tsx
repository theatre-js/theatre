
import AbstractDerivation from './AbstractDerivation'

export class ConstantDerivation<V> extends AbstractDerivation<V> {
  _v: V

  constructor(v: V) {
    super()
    this._v = v
    return this
  }

  _recalculate() {
    return this._v
  }
}

export default function constant<V>(v: V) {
  return new ConstantDerivation(v)
}
