// @flow
import AbstractDerivedDict from './AbstractDerivedDict'
import type {IDerivedDict} from './types'
import _ from 'lodash'
import {default as box, type IBoxAtom} from '$shared/DataVerse/atoms/box'
import type {IDerivation} from '../types'

export interface IProxyDerivedDict<O: {}> extends IDerivedDict<O> {
  setSource(IDerivedDict<O>): IProxyDerivedDict<O>;
}

class ProxyDerivedDict<O> extends AbstractDerivedDict
  implements IProxyDerivedDict<O> {
  _sourceBox: IBoxAtom<IDerivedDict<O>>
  _sourceBoxD: IDerivation<IDerivedDict<O>>

  constructor(source: IDerivedDict<O>): IProxyDerivedDict<O> {
    super()
    this._sourceBox = box(source)
    this._sourceBoxD = this._sourceBox.derivation()

    return this
  }

  setSource(newSource: IDerivedDict<O>): IProxyDerivedDict<O> {
    const oldSource = this._sourceBox.getValue()
    this._sourceBox.set(newSource)

    if (this._changeEmitterHasTappers) {
      this._reactToNotHavingTappers()
      this._reactToHavingTappers()

      const oldKeys = oldSource.keys()
      const newKeys = newSource.keys()

      const change = {
        addedKeys: _.difference(newKeys, oldKeys),
        deletedKeys: _.difference(oldKeys, newKeys),
      }

      if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
        this._changeEmitter.emit(change)
    }

    return this
  }

  _reactToHavingTappers() {
    this._untapFromSourceChanges = this._sourceBox
      .getValue()
      .changes()
      .tap(c => {
        this._changeEmitter.emit(c)
      })
  }

  _reactToNotHavingTappers() {
    this._untapFromSourceChanges()
    this._untapFromSourceChanges = _.noop
  }

  keys() {
    return this._sourceBox.getValue().keys()
  }

  prop(key) {
    return this._sourceBoxD.flatMap(source => source.prop(key))
  }

  // _directProp(key) {
  //   // return this._source.prop(key)
  // }
}

export default function proxyDerivedDict<O: {}>(
  initialSource: IDerivedDict<O>,
): IProxyDerivedDict<O> {
  return new ProxyDerivedDict(initialSource)
}
