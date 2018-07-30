import Emitter from '$shared/DataVerse/utils/Emitter'
import {default as Tappable} from '$shared/DataVerse/utils/Tappable'
import AbstractDerivation, {
  IObjectWhoListensToAtomicUpdateNotices,
} from '$shared/DataVerse/derivations/AbstractDerivation'

/**
 * Just like DerivationEmitter, except it doesn't emit the value and doesn't need a ticker
 */
export default class DerivationValuelessEmitter<V>
  implements IObjectWhoListensToAtomicUpdateNotices {
  _derivation: AbstractDerivation<V>
  _emitter: Emitter<void>
  _lastValue: undefined | V
  _lastValueRecorded: boolean
  _hadTappers: boolean

  constructor(
    derivation: AbstractDerivation<V>,
    readonly dontEmitValues: boolean = false,
  ) {
    this._derivation = derivation
    this._emitter = new Emitter()
    this._emitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfTappersChange()
    })
    this._hadTappers = false
    this._lastValueRecorded = false
    this._lastValue = undefined
    return this
  }

  _youMayNeedToUpdateYourself() {
    this._emitter.emit(undefined)
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

  tappable(): Tappable<void> {
    return this._emitter.tappable
  }
}
