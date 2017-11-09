// @flow
import * as D from '$shared/DataVerse'
import _ from 'lodash'

type Dict = $FixMe
type EmptyFn = () => void

const styleSetter = (elRef: HTMLElement, unprefixedKey: string) => {
  const key = unprefixedKey // @todo add vendor prefixes
  return (value: ?string) => {
    const finalValue = value === null || value === undefined ? '' : value
    // $FixMe
    elRef.style[key] = finalValue
  }
}

export default class ReifiedStyleApplier {
  _dict: Dict
  _ticker: D.ITicker
  _reifiedStylesProxy: $FixMe
  _untapFromProxy: () => void
  _started: boolean
  _elRefD: D.IDerivation<?HTMLElement>
  _activeKeys: {[key: string]: {remove: EmptyFn, stopObserving: EmptyFn}}

  constructor(dict: Dict, ticker: D.ITicker) {
    this._dict = dict
    this._ticker = ticker
    const reifiedStylesP = this._dict.pointer().prop('reifiedStyles')
    this._reifiedStylesProxy = D.derivations.autoProxyDerivedDict(
      reifiedStylesP,
      ticker,
    )

    this._elRefD = dict
      .pointer()
      .prop('state')
      .prop('elRef')

    this._untapFromProxy = _.noop
    this._started = false
    this._activeKeys = {}
  }

  start() {
    if (this._started) {
      throw new Error(`This ReifiedStyleApplier is already started`)
    }

    this._started = true

    this._untapFromProxy = this._reifiedStylesProxy.changes().tap(changes => {
      changes.deletedKeys.forEach(this._removeKey)
      changes.addedKeys.forEach(this._startObservingKey)
    })

    this._reifiedStylesProxy.keys().forEach(this._startObservingKey)
  }

  stop() {
    if (!this._started) {
      throw new Error(`This ReifiedStyleApplier has never been started`)
    }
    this._started = false

    this._untapFromProxy()
    this._untapFromProxy = _.noop

    for (let k in this._activeKeys) {
      this._stopObservingKey(k)
    }
  }

  _startObservingKey = (key: string) => {
    this._removeKey(key)

    const valueD = this._reifiedStylesProxy.prop(key)

    const setterD: D.IDerivation<($FixMe) => void> = this._elRefD.flatMap(
      elRef => {
        if (!elRef) return () => {}
        return styleSetter(elRef, key)
      },
    )

    let lastSetter: $FixMe => void = _.noop

    const untap = D.derivations
      .withDeps({valueD, setterD}, ({valueD, setterD}) => ({valueD, setterD}))
      .tapImmediate(this._ticker, ({valueD, setterD}) => {
        lastSetter = setterD.getValue()
        lastSetter(valueD.getValue())
      })

    const stopObserving = () => {
      untap()
    }

    const remove = () => {
      stopObserving()
      lastSetter(null)
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
