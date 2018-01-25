import {ProxyDerivation} from '$src/shared/DataVerse/derivations/proxy'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

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
