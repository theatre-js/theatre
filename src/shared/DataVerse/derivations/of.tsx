import constant from './constant'
import AbstractDerivation, {
  isDerivation,
} from '$src/shared/DataVerse/derivations/AbstractDerivation'

export default function of<V>(
  d: V | AbstractDerivation<V>,
): AbstractDerivation<V> {
  if (isDerivation(d)) {
    return d
  } else {
    return constant(d)
  }
}
