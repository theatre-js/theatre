// @flow
import * as D from '$shared/DataVerse'
import _ from 'lodash'
import {domAttrSetter} from './utils'

type Dict = $FixMe
type EmptyFn = () => void

declare var SVGElement: Element

export default class AttributesApplier {
  _dict: Dict
  _ticker: D.ITicker
  _domAttributesProxy: $FixMe
  _untapFromProxy: () => void
  _started: boolean
  _elRefD: D.IDerivation<?HTMLElement>
  _isElSvgD: D.IDerivation<boolean>
  _activeKeys: {[key: string]: {remove: EmptyFn, stopObserving: EmptyFn}}

  constructor(dict: Dict, ticker: D.ITicker) {
    this._dict = dict
    this._ticker = ticker
    const domAttributesP = this._dict.pointer().prop('domAttributes')
    this._domAttributesProxy = D.derivations.autoProxyDerivedDict(
      domAttributesP,
      ticker,
    )

    this._elRefD = dict
      .pointer()
      .prop('state')
      .prop('elRef')

    this._isElSvgD = (this._elRefD.map(
      el => !!(typeof el !== 'undefined' && el instanceof SVGElement),
    ): D.IDerivation<boolean>)

    this._untapFromProxy = _.noop
    this._started = false
    this._activeKeys = {}
  }

  start() {
    if (this._started) {
      throw new Error(`This AttributesApplier is already started`)
    }

    this._started = true

    this._untapFromProxy = this._domAttributesProxy.changes().tap(changes => {
      changes.deletedKeys.forEach(this._removeKey)
      changes.addedKeys.forEach(this._startObservingKey)
    })

    this._domAttributesProxy.keys().forEach(this._startObservingKey)
  }

  stop() {
    if (!this._started) {
      throw new Error(`This AttributesApplier has never been started`)
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

    const valueD = this._domAttributesProxy.prop(key)

    const setterD: D.IDerivation<($FixMe) => void> = D.derivations.withDeps(
      {elRefD: this._elRefD, isElSvgD: this._isElSvgD},
      ({elRefD, isElSvgD}) => {
        const elRef = elRefD.getValue()

        if (!elRef) return () => {}
        return domAttrSetter(elRef, key, isElSvgD.getValue())
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
