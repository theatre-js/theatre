import constant from './constant'
import AbstractDerivation, {
  isDerivation,
} from '$shared/DataVerse/derivations/AbstractDerivation'

/**
 * Turns any value into a constant derivation, unless that value is itself a derivation
 */
export default function of<V>(
  d: V | AbstractDerivation<V>,
): AbstractDerivation<V> {
  if (isDerivation(d)) {
    return d
  } else {
    return constant(d)
  }
}
