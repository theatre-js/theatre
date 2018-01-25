// @flow
import AbstractDerivation from './AbstractDerivation'
import type {AbstractDerivation} from './types'

export class ProxyDerivation<V> extends AbstractDerivation
  implements IProxyDerivation<V> {
  getValue: () => V
  _target: AbstractDerivation<V>

  constructor(target: AbstractDerivation<V>): IProxyDerivation<V> {
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

export interface IProxyDerivation<V> extends AbstractDerivation<V> {
  setTarget(target: AbstractDerivation<V>): IProxyDerivation<V>;
}

export default function proxy<V, D: AbstractDerivation<V>>(
  target: D,
): IProxyDerivation<V> {
  return new ProxyDerivation(target)
}
