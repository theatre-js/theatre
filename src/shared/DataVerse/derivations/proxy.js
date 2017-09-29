// @flow
import Derivation from './Derivation'
import type {IDerivation} from './types'

export class ProxyDerivation<V> extends Derivation implements IProxyDerivation<V> {
  getValue: () => V
  _target: IDerivation<V>

  constructor(target: IDerivation<V>): IProxyDerivation<V> {
    super()
    this._target = target

    this._addDependency(target)
    return this
  }

  setTarget(target: IDerivation<V>) {
    if (target === this._target) return
    this._removeDependency(this._target)
    this._target = target
    this._addDependency(this._target)
  }

  _recalculate(): $FixMe {
    return this._target.getValue()
  }
}

export interface IProxyDerivation<V> extends IDerivation<V> {
  setTarget(target: IDerivation<V>): void,
}

export default function proxy<V, D: IDerivation<V>>(target: D): IProxyDerivation<V> {
  return new ProxyDerivation(target)
}