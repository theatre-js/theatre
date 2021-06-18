import Emitter from '../utils/Emitter'
import type {default as Tappable} from '../utils/Tappable'
import type {IDerivation} from './IDerivation'

/**
 * Just like DerivationEmitter, except it doesn't emit the value and doesn't need a ticker
 */
export default class DerivationValuelessEmitter<V> {
  _derivation: IDerivation<V>
  _emitter: Emitter<void>
  _hadTappers: boolean

  constructor(
    derivation: IDerivation<V>,
    readonly dontEmitValues: boolean = false,
  ) {
    this._derivation = derivation
    this._emitter = new Emitter()
    this._emitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._hadTappers = false
    return this
  }

  private _possiblyMarkAsStale = () => {
    this._emitter.emit(undefined)
  }

  _reactToNumberOfTappersChange() {
    const hasTappers = this._emitter.hasTappers()
    if (hasTappers !== this._hadTappers) {
      this._hadTappers = hasTappers
      if (hasTappers) {
        this._derivation.addDependent(this._possiblyMarkAsStale)
      } else {
        this._derivation.removeDependent(this._possiblyMarkAsStale)
      }
    }
  }

  tappable(): Tappable<void> {
    return this._emitter.tappable
  }
}
