import DerivationFromSource from './derivations/DerivationFromSource'
import type {IDerivation} from './derivations/IDerivation'
import Emitter from './utils/Emitter'
export interface IBox<V> {
  set(v: V): void
  get(): V
  derivation: IDerivation<V>
}

export default class Box<V> implements IBox<V> {
  private _publicDerivation: IDerivation<V>
  private _emitter = new Emitter<V>()

  constructor(protected _value: V) {
    this._publicDerivation = new DerivationFromSource(
      (listener) => this._emitter.tappable.tap(listener),
      this.get.bind(this),
    )
  }

  set(v: V) {
    this._value = v
    this._emitter.emit(v)
  }

  get() {
    return this._value
  }

  get derivation() {
    return this._publicDerivation
  }
}
