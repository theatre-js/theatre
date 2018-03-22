import AbstractDerivation from './AbstractDerivation'

export class ProxyDerivation<V> extends AbstractDerivation<V> {
  _target: AbstractDerivation<V>

  constructor(target: AbstractDerivation<V>) {
    super()
    this._target = target

    this._addDependency(target)
    return this
  }

  setTarget(target: AbstractDerivation<V>): this {
    if (target === this._target) return this
    this._removeDependency(this._target)
    this._target = target
    this._addDependency(this._target)
    this._youMayNeedToUpdateYourself(this)
    return this
  }

  _recalculate(): $FixMe {
    return this._target.getValue()
  }
}

export default function proxy<V, D extends AbstractDerivation<V>>(target: D) {
  return new ProxyDerivation(target)
}
