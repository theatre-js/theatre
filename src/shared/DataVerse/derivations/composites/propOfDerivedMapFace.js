// @flow
import {ProxyDerivation, type IProxyDerivation} from '../proxy'
import {type IDerivation} from '../types'

export interface IDerivationOfAPropOfADerivedMapFace<V> extends IProxyDerivation<V> {}

export class DerivationOfAPropOfADerivedMapFace<V> extends ProxyDerivation<V> implements IDerivationOfAPropOfADerivedMapFace<V> {}

export default function propOfDerivedMapFace<V, D: IDerivation<V>>(target: D): IDerivationOfAPropOfADerivedMapFace<V> {
  return new DerivationOfAPropOfADerivedMapFace(target)
}