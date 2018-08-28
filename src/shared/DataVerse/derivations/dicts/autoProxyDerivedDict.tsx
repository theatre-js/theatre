import AbstractDerivedDict from './AbstractDerivedDict'
import _ from 'lodash'
import {default as proxyDerivedDict, ProxyDerivedDict} from './proxyDerivedDict'
import emptyDict from './emptyDict'
import Ticker from '$shared/DataVerse/Ticker'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

class AutoProxyDerivedDict<O> extends AbstractDerivedDict<O> {
  _proxy: ProxyDerivedDict<O>
  _sourceD: AbstractDerivation<AbstractDerivedDict<O>>
  _ticker: Ticker
  _untapFromProxyChanges: () => void
  _untapFromSourceChanges: () => void

  constructor(
    sourceD: AbstractDerivation<AbstractDerivedDict<O>>,
    ticker: Ticker,
  ) {
    super()
    this._ticker = ticker
    this._sourceD = sourceD
    this._untapFromProxyChanges = _.noop
    this._untapFromSourceChanges = _.noop
    this._proxy = proxyDerivedDict(emptyDict as $IntentionalAny)

    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._sourceD.tapImmediate(
      this._ticker,
      newDerivedDict => {
        this._proxy.setSource(newDerivedDict)
      },
    )

    this._untapFromProxyChanges = this._proxy.changes().tap((c: $FixMe) => {
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

  // @ts-ignore @todo
  prop(key: keyof O) {
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
  initialSource: AbstractDerivation<AbstractDerivedDict<O>>,
  ticker: Ticker,
): AutoProxyDerivedDict<O> {
  return new AutoProxyDerivedDict(initialSource, ticker)
}
