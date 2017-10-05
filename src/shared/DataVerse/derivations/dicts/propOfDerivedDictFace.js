// @flow
import {ProxyDerivation, type IProxyDerivation} from '../proxy'
import {type IDerivation} from '../types'

export interface IDerivationOfAPropOfADerivedDictFace<V> extends IProxyDerivation<V> {}

export class DerivationOfAPropOfADerivedDictFace<V> extends ProxyDerivation<V> implements IDerivationOfAPropOfADerivedDictFace<V> {}

export default function propOfDerivedDictFace<V, D: IDerivation<V>>(target: D): IDerivationOfAPropOfADerivedDictFace<V> {
  return new DerivationOfAPropOfADerivedDictFace(target)
}