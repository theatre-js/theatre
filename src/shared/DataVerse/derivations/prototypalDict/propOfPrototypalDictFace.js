// @flow
import {ProxyDerivation, type IProxyDerivation} from '../proxy'
import {type IDerivation} from '../types'

export interface IDerivationOfAPropOfPrototypalDictFace<V> extends IProxyDerivation<V> {}

export class DerivationOfAPropOfAPrototypalDictFace<V> extends ProxyDerivation<V>
  implements IDerivationOfAPropOfPrototypalDictFace<V> {}

export default function propOfPrototypalDictFace<V, D: IDerivation<V>>(
  target: D,
): IDerivationOfAPropOfPrototypalDictFace<V> {
  return new DerivationOfAPropOfAPrototypalDictFace(target)
}
