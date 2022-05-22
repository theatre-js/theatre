import Emitter from '../utils/Emitter'
import type {default as Tappable} from '../utils/Tappable'
import type {IDerivation} from './IDerivation'

/**
 * Like DerivationEmitter, but with a different performance model. DerivationValuelessEmitter emits every time the
 * derivation is updated, even if the value didn't change, and tappers are called without the value. The advantage of
 * this is that you have control over when the underlying derivation is freshened, it won't automatically be freshened
 * by the emitter.
 */
export default class DerivationValuelessEmitter<V> {
  _derivation: IDerivation<V>
  _emitter: Emitter<void>
  _hadTappers: boolean

  constructor(derivation: IDerivation<V>) {
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

  /**
   * The tappable associated with the emitter. You can use it to tap (subscribe to) the underlying derivation.
   */
  tappable(): Tappable<void> {
    return this._emitter.tappable
  }
}
