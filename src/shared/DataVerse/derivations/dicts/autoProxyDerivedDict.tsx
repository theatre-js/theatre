// @flow
import AbstractDerivedDict from './AbstractDerivedDict'
import {IDerivedDict} from './types'
import {ITicker} from '$shared/DataVerse/Ticker'
import _ from 'lodash'
import {AbstractDerivation} from '../types'
import {
  default as proxyDerivedDict,
  IProxyDerivedDict,
} from './proxyDerivedDict'
import emptyDict from './emptyDict'

class AutoProxyDerivedDict<O> extends AbstractDerivedDict
  implements IDerivedDict<O> {
  _proxy: IProxyDerivedDict<O>
  _sourceD: AbstractDerivation<IDerivedDict<O>>
  _ticker: ITicker
  _untapFromProxyChanges: () => void
  _untapFromSourceChanges: () => void

  constructor(
    sourceD: AbstractDerivation<IDerivedDict<O>>,
    ticker: ITicker,
  ): IDerivedDict<O> {
    super()
    this._ticker = ticker
    this._sourceD = sourceD
    this._untapFromProxyChanges = _.noop
    this._untapFromSourceChanges = _.noop
    this._proxy = proxyDerivedDict(emptyDict)

    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._sourceD.tapImmediate(
      this._ticker,
      newDerivedDict => {
        this._proxy.setSource(newDerivedDict)
      },
    )

    this._untapFromProxyChanges = this._proxy.changes().tap(c => {
      this._changeEmitter.emit(c)
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromProxyChanges()
    this._untapFromProxyChanges = _.noop
    this._untapFromSourceChanges()
    this._untapFromSourceChanges = _.noop
  }

  keys() {
    if (!this._changeEmitterHasTappers) {
      this._proxy.setSource(this._sourceD.getValue())
    }
    return this._proxy.keys()
  }

  prop(key) {
    return this._sourceD.flatMap(source => {
      // dirty, I know :D
      if (!this._changeEmitterHasTappers) {
        this._proxy.setSource(source)
      }

      return this._proxy.prop(key)
    })
  }
}

export default function autoProxyDerivedDict<O>(
  initialSource: AbstractDerivation<IDerivedDict<O>>,
  ticker: ITicker,
): IDerivedDict<O> {
  return new AutoProxyDerivedDict(initialSource, ticker)
}
