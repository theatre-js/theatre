// @flow
import Derivation from './Derivation'

export default class ProxyDerivation<V> extends Derivation<V> {
  _target: Derivation<V>

  constructor(target: Derivation<V>) {
    super()
    this._target = target

    target._addDependent(this)
  }

  setTarget(target: Derivation<V>) {
    this._target._removeDependent(this)
    this._target = target
    target._addDependent(this)
  }

  _recalculate(): $FixMe {
    return this._target.getValue()
  }
}