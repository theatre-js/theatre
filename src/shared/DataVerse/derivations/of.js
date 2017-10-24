// @flow
import type {IDerivation} from './types'
import constant from './constant'

export default function of<V>(d: V | IDerivation<V>): IDerivation<V> {
  if (d && d.isDerivation === 'True') {
    return (d: $IntentionalAny)
  } else {
    return (constant(d): $IntentionalAny)
  }
}