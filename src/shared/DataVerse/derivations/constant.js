// @flow
import AbstractDerivation from './AbstractDerivation'
import type {AbstractDerivation} from './types'

export class ConstantDerivation<V> extends AbstractDerivation
  implements AbstractDerivation<V> {
  _v: V

  constructor(v: V): AbstractDerivation<V> {
    super()
    this._v = v
    return this
  }

  _recalculate(): $FixMe {
    return this._v
  }
}

export default function constant<V>(v: V): AbstractDerivation<V> {
  return new ConstantDerivation(v)
}
