import * as _ from 'lodash-es'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Ticker from '$shared/DataVerse/Ticker'
import withDeps from '$shared/DataVerse/derivations/withDeps'

type Dict = $FixMe
type EmptyFn = () => void

type Xigulu = {
  apply: (value: $FixMe) => void
  unapply: () => void
}

type GetXiguluForKey = (key: string) => AbstractDerivation<Xigulu>

export default class KeyedSideEffectRunner {
  _dict: Dict
  _ticker: Ticker
  _sideEffectsDict: $FixMe
  _untapFromDict: () => void
  _started: boolean
  _activeKeys: {[key: string]: {remove: EmptyFn; stopObserving: EmptyFn}}
  _getXiguluForKey: (key: string) => AbstractDerivation<Xigulu>

  constructor(
    sideEffectsDict: Dict,
    ticker: Ticker,
    getXiguluForKey: GetXiguluForKey,
  ) {
    this._sideEffectsDict = sideEffectsDict
    this._ticker = ticker
    this._getXiguluForKey = getXiguluForKey

    this._untapFromDict = _.noop
    this._started = false
    this._activeKeys = {}
  }

  start() {
    if (this._started) {
      throw new Error(`This KeyedSideEffectRunner is already started`)
    }

    this._started = true

    this._untapFromDict = this._sideEffectsDict
      .changes()
      .tap((changes: $FixMe) => {
        changes.deletedKeys.forEach(this._removeKey)
        changes.addedKeys.forEach(this._startObservingKey)
      })

    this._sideEffectsDict.keys().forEach(this._startObservingKey)
  }

  stop() {
    if (!this._started) {
      throw new Error(`This KeyedSideEffectRunner has never been started`)
    }
    this._started = false

    this._untapFromDict()
    this._untapFromDict = _.noop

    for (let k in this._activeKeys) {
      this._stopObservingKey(k)
    }
  }

  _startObservingKey = (key: string) => {
    this._removeKey(key)

    const valueD = this._sideEffectsDict.prop(key)

    const xigulu: AbstractDerivation<Xigulu> = this._getXiguluForKey(key)

    const untap = withDeps({valueD, xigulu}, ({valueD, xigulu}) => ({
      valueD,
      xigulu,
    })).tapImmediate(this._ticker, ({valueD, xigulu}) => {
      xigulu.getValue().apply(valueD.getValue())
    })

    const stopObserving = () => {
      untap()
    }

    const remove = () => {
      const {unapply} = xigulu.getValue()
      stopObserving()
      unapply()
    }

    this._activeKeys[key] = {stopObserving, remove}
  }

  _stopObservingKey = (key: string) => {
    const a = this._activeKeys[key]
    if (!a) {
      return
    }

    a.remove()
    delete this._activeKeys[key]
  }

  _removeKey = (key: string) => {
    const a = this._activeKeys[key]
    if (!a) {
      return
    }

    a.remove()
    delete this._activeKeys[key]
  }
}
