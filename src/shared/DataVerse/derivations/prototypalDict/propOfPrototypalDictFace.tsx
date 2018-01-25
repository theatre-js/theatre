
import {ProxyDerivation, IProxyDerivation} from '../proxy'
import {AbstractDerivation} from '../types'

export interface AbstractDerivationOfAPropOfPrototypalDictFace<V>
  extends IProxyDerivation<V> {}

export class DerivationOfAPropOfAPrototypalDictFace<V> extends ProxyDerivation<
  V,
> implements AbstractDerivationOfAPropOfPrototypalDictFace<V> {
  static displayName = 'PDF.Prop'
}

export default function propOfPrototypalDictFace<V, D: AbstractDerivation<V>>(
  target: D,
): AbstractDerivationOfAPropOfPrototypalDictFace<V> {
  return new DerivationOfAPropOfAPrototypalDictFace(target)
}
