import AbstractDerivation from './derivations/AbstractDerivation'
import {ProxyDerivation} from './derivations/proxy'
export interface IBox<V> {
  set(v: V): void
  get(): V
  derivation: AbstractDerivation<V>
}

class BoxAtom<V> implements IBox<V> {
  private _mutableDerivation: MutableDerivation<V>
  private _publicDerivation: AbstractDerivation<V>
  constructor(protected _value: V) {
    this._mutableDerivation = new MutableDerivation(this._value)
    this._publicDerivation = new ProxyDerivation(this._mutableDerivation)
  }

  set(v: V) {
    this._value = v
    this._mutableDerivation.set(v)
  }

  get() {
    return this._value
  }

  get derivation() {
    return this._publicDerivation
  }
}

class MutableDerivation<V> extends AbstractDerivation<V> {
  constructor(protected _value: V) {
    super()
  }

  _recalculate() {
    return this._value
  }

  _keepUptodate() {}

  set(v: V) {
    if (v === this._value) return
    this._value = v
    this._youMayNeedToUpdateYourself(this)
  }

  _stopKeepingUptodate() {}
}

export const box = <V>(initialValue: V) => new BoxAtom(initialValue)
