// @flow
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {default as Tappable} from '$shared/DataVerse/utils/Tappable'
import type {IDerivation} from './types'
import type {ITicker} from '$shared/DataVerse/Ticker'

interface IDerivationEmitter<V> {
  tappable(): Tappable<V>;
}

export default class DerivationEmitter<V> implements IDerivationEmitter<V> {
  _derivation: IDerivation<V>
  _ticker: ITicker
  _emitter: Emitter<V>
  _lastValue: V
  _lastValueRecorded: boolean
  _hadTappers: boolean

  constructor(derivation: IDerivation<V>, ticker: ITicker): IDerivationEmitter<V> {
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

  tappable() {
    return (this._emitter.tappable: $IntentionalAny)
  }

  _updateComputation() {
    const newValue = this._derivation.getValue()
    if (newValue === this._lastValue && this._lastValueRecorded === true) return
    this._lastValue = newValue
    this._lastValueRecorded = true
    this._emitter.emit(newValue)
  }
}
