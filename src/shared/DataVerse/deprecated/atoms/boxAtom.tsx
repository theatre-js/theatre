import AbstractAtom from './utils/AbstractAtom'
import {DerivationOfABoxAtom} from '$shared/DataVerse/deprecated/atomDerivations/boxes/deriveFromBoxAtom'

export class BoxAtom<V> extends AbstractAtom<V> {
  isBoxAtom = true
  _value: V

  constructor(v: V) {
    super()
    this._value = v
    return this
  }

  unboxDeep(): V {
    return this._value
  }

  set(value: V): this {
    this._value = value

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(value)
    }

    return this
  }

  getValue(): V {
    return this._value
  }

  derivation(): DerivationOfABoxAtom<V> {
    const deriveFromBoxAtom = require('$shared/DataVerse/deprecated/atomDerivations/boxes/deriveFromBoxAtom')
      .default
    return deriveFromBoxAtom(this)
  }
}

export default function boxAtom<V>(v: V): BoxAtom<V> {
  return new BoxAtom(v)
}
