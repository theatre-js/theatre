// @flow
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

export class ProxyDerivation<V> extends AbstractDerivation implements IProxyDerivation<V> {
  getValue: () => V
  _target: IDerivation<V>

  constructor(target: IDerivation<V>): IProxyDerivation<V> {
    super()
    this._target = target

    this._addDependency(target)
    return this
  }

  setTarget(target: IDerivation<V>): this {
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

export interface IProxyDerivation<V> extends IDerivation<V> {
  setTarget(target: IDerivation<V>): IProxyDerivation<V>,
}

export default function proxy<V, D: IDerivation<V>>(target: D): IProxyDerivation<V> {
  return new ProxyDerivation(target)
}