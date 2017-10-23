// @flow
import AbstractDerivedDict from './AbstractDerivedDict'
import type {IDerivedDict} from './types'
import _ from 'lodash'
import type {IDerivation} from '../types'
import {default as proxyDerivedDict, type IProxyDerivedDict} from './proxyDerivedDict'

class AutoProxyDerivedDict<O: {}> extends AbstractDerivedDict implements IDerivedDict<O> {
  _proxy: IProxyDerivedDict<O>
  _sourceD: IDerivation<IDerivedDict<O>>
  _untapFromProxyChanges: () => void
  _untapFromSourceChanges: () => void

  constructor(sourceD: IDerivation<IDerivedDict<O>>): IDerivedDict<O> {
    super()
    this._sourceD  = sourceD
    this._untapFromProxyChanges  = _.noop
    this._untapFromSourceChanges = _.noop
    this._proxy = proxyDerivedDict(sourceD.getValue())

    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._sourceD.changes().tap((newDerivedDict) => {
      this._proxy.setSource(newDerivedDict)
    })

    this._untapFromProxyChanges = this._proxy.changes().tap((c) => {
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
    return this._sourceD.flatMap((source) => {
      // dirty, I know :D
      if (!this._changeEmitterHasTappers) {
        this._proxy.setSource(source)
      }

      return this._proxy.prop(key)
    })
  }
}

export default function autoProxyDerivedDict<O: {}>(initialSource: IDerivation<IDerivedDict<O>>): IDerivedDict<O> {
  return new AutoProxyDerivedDict(initialSource)
}