// @flow
import * as D from '$shared/DataVerse'
import _ from 'lodash'

type Dict = $FixMe
type EmptyFn = () => void

type Xigulu = {
  apply: (value: $FixMe) => void,
  unapply: () => void,
}

type GetXiguluForKey = (key: string) => D.IDerivation<Xigulu>

export default class KeyedSideEffectRunner {
  _dict: Dict
  _ticker: D.ITicker
  _sideEffectsDict: $FixMe
  _untapFromDict: () => void
  _started: boolean
  _activeKeys: {[key: string]: {remove: EmptyFn, stopObserving: EmptyFn}}
  _getXiguluForKey: (key: string) => D.IDerivation<Xigulu>

  constructor(
    sideEffectsDict: Dict,
    ticker: D.ITicker,
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

    this._untapFromDict = this._sideEffectsDict.changes().tap(changes => {
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

    const xigulu: D.IDerivation<Xigulu> = this._getXiguluForKey(key)

    const untap = D.derivations
      .withDeps({valueD, xigulu}, ({valueD, xigulu}) => ({valueD, xigulu}))
      .tapImmediate(this._ticker, ({valueD, xigulu}) => {
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

    a.stopObserving()
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
