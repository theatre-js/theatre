import constant from './constant'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

export default function of<V>(
  d: V | AbstractDerivation<V>,
): AbstractDerivation<V> {
  if (d && d.isDerivation === 'True') {
    return d as $IntentionalAny
  } else {
    return constant(d) as $IntentionalAny
  }
}
