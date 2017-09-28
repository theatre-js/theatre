// @flow
import Derivation from './Derivation'

export default class ProxyDerivation<V> extends Derivation<V> {
  _target: Derivation<V>

  constructor(target: Derivation<V>) {
    super()
    this._target = target

    this._addDependency(target)
  }

  setTarget(target: Derivation<V>) {
    if (target === this._target) return
    this._removeDependency(this._target)
    this._target = target
    this._addDependency(this._target)
  }

  _recalculate(): $FixMe {
    return this._target.getValue()
  }
}