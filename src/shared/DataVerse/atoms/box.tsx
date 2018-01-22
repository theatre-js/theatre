import {default as AbstractAtom} from './utils/AbstractAtom'

export class BoxAtom<V> extends AbstractAtom<V> {
  isBoxAtom = 'True'
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

  derivation(): IDerivation<V> {
    const deriveFromBoxAtom = require('$shared/DataVerse/derivations/ofAtoms/deriveFromBoxAtom')
      .default
    return deriveFromBoxAtom(this)
  }
}

export default function box<V>(v: V): BoxAtom<V> {
  return new BoxAtom(v)
}
