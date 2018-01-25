// @flow
import type {AbstractDerivation} from './types'
import constant from './constant'

export default function of<V>(d: V | AbstractDerivation<V>): AbstractDerivation<V> {
  if (d && d.isDerivation === 'True') {
    return (d: $IntentionalAny)
  } else {
    return (constant(d): $IntentionalAny)
  }
}
