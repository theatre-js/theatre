// @flow
import {D} from '$studio/handy'

export default class ValueInstance {
  _descP: *
  _timeD: *
  _pointsP: *
  _pointsProxy: *
  _ticker: $FixMe

  constructor(descP: $FixMe, timeD: $FixMe, ticker: $FixMe) {
    this._descP = descP
    this._ticker = ticker
    this._pointsP = descP.prop('points').prop('byId')
    this._pointsProxy = D.derivations.autoProxyDerivedDict(
      this._pointsP,
      this._ticker,
    )
    this._timeD = timeD
  }

  derivation() {
    // console.log('der', this._descP.getValue())
    return 0.52
  }
}
