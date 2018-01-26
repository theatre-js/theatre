import Emitter from '$shared/DataVerse/utils/Emitter'
import {default as Tappable} from '$shared/DataVerse/utils/Tappable'
import AbstractDerivation, {
  IObjectWhoListensToAtomicUpdateNotices,
} from '$src/shared/DataVerse/derivations/AbstractDerivation'
import Ticker from '$src/shared/DataVerse/Ticker'

export default class DerivationEmitter<V>
  implements IObjectWhoListensToAtomicUpdateNotices {
  _derivation: AbstractDerivation<V>
  _ticker: Ticker
  _emitter: Emitter<V>
  _lastValue: undefined | V
  _lastValueRecorded: boolean
  _hadTappers: boolean

  constructor(derivation: AbstractDerivation<V>, ticker: Ticker) {
    this._derivation = derivation
    this._ticker = ticker
    this._emitter = new Emitter()
    this._emitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._hadTappers = false
    this._lastValueRecorded = false
    // $FlowIgnore
    this._lastValue = undefined
    return this
  }

  _youMayNeedToUpdateYourself() {
    this._ticker.registerComputationUpdate(this)
  }

  _reactToNumberOfTappersChange() {
    const hasTappers = this._emitter.hasTappers()
    if (hasTappers !== this._hadTappers) {
      this._hadTappers = hasTappers
      if (hasTappers) {
        this._derivation._addDependent(this)
      } else {
        this._derivation._removeDependent(this)
      }
    }
  }

  tappable(): Tappable<V> {
    return this._emitter.tappable
  }

  _updateComputation() {
    const newValue = this._derivation.getValue()
    if (newValue === this._lastValue && this._lastValueRecorded === true) return
    this._lastValue = newValue
    this._lastValueRecorded = true
    this._emitter.emit(newValue)
  }
}
