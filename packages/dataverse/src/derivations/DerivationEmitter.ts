import type Ticker from '../Ticker'
import Emitter from '../utils/Emitter'
import type {default as Tappable} from '../utils/Tappable'
import type {IDerivation} from './IDerivation'

/**
 * An event emitter that emits events on changes to a derivation.
 */
export default class DerivationEmitter<V> {
  private _derivation: IDerivation<V>
  private _ticker: Ticker
  private _emitter: Emitter<V>
  private _lastValue: undefined | V
  private _lastValueRecorded: boolean
  private _hadTappers: boolean

  /**
   * @param derivation - The derivation to emit events for.
   * @param ticker - The ticker to use to batch events.
   */
  constructor(derivation: IDerivation<V>, ticker: Ticker) {
    this._derivation = derivation
    this._ticker = ticker
    this._emitter = new Emitter()
    this._emitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._hadTappers = false
    this._lastValueRecorded = false
    this._lastValue = undefined
    return this
  }

  private _possiblyMarkAsStale = () => {
    this._ticker.onThisOrNextTick(this._refresh)
  }

  private _reactToNumberOfTappersChange() {
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
  tappable(): Tappable<V> {
    return this._emitter.tappable
  }

  private _refresh = () => {
    const newValue = this._derivation.getValue()
    if (newValue === this._lastValue && this._lastValueRecorded === true) return
    this._lastValue = newValue
    this._lastValueRecorded = true
    this._emitter.emit(newValue)
  }
}
