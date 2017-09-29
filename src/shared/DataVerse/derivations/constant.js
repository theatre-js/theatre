// @flow
import Derivation from './Derivation'
import type {IDerivation} from './types'

export class ConstantDerivation<V> extends Derivation implements IDerivation<V> {
  getValue: () => V

  _v: V
  constructor(v: V): IDerivation<V> {
    super()
    this._v = v
    return this
  }

  _recalculate(): $FixMe {
    return this._v
  }
}

export default function constant<V>(v: V): IDerivation<V> {
  return new ConstantDerivation(v)
}