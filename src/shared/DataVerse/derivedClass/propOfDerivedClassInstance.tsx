import {ProxyDerivation} from '$shared/DataVerse/derivations/proxy'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

export class DerivationOfAPropOfADerivedClassInstance<
  V
> extends ProxyDerivation<V> {
  static displayName = 'PDF.Prop'
}

export default function propOfDerivedClassInstance<
  V,
  D extends AbstractDerivation<V>
>(target: D) {
  return new DerivationOfAPropOfADerivedClassInstance(target)
}
