// @flow
import Derivation from './Derivation'

export default class ConstantDerivation<V> extends Derivation<V> {
  _v: V
  constructor(v: V) {
    super()
    this._v = v
  }

  _recalculate(): $FixMe {
    return this._v
  }
}