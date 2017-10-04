// @flow
// import type {IDerivedMap} from './types'
import Emitter from '$shared/DataVerse/utils/Emitter'

export default class DerivedMap {
  _changeEmitter: *
  _untapFromSourceChanges: *
  _changeEmitterHasTappers: boolean
  +_reactToHavingTappers: () => void
  +_reactToNotHavingTappers: () => void

  constructor() {
    this._changeEmitter = new Emitter()
    this._changeEmitterHasTappers = false
    this._changeEmitter.onNumberOfTappersChange(() => {this._reactToNumberOfChangeTappersChange()})
  }

  _reactToNumberOfChangeTappersChange() {
    const hasTappers = this._changeEmitter.hasTappers()
    if (hasTappers === this._changeEmitterHasTappers) return
    this._changeEmitterHasTappers = hasTappers
    if (hasTappers) {
      this._reactToHavingTappers()

    } else {
      this._reactToNotHavingTappers()
    }
  }

  changes() {
    return this._changeEmitter.tappable
  }
}