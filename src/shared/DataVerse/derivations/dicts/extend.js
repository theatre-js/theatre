// @flow
import type {IDerivation} from '../types'
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {IDerivedDict, ChangeType} from './types'
import DerivedDict from './AbstractDerivedDict'
import _ from 'lodash'

export class ExtendDerivedDict extends DerivedDict implements IDerivedDict<$FixMe> {
  _changeEmitter: Emitter<ChangeType<$FixMe>>
  _base: IDerivedDict<$FixMe>
  _overrider: IDerivedDict<$FixMe>
  _untapFromBaseChanges: () => void
  _untapFromOverriderChanges: () => void

  constructor<B: {}, OV: {}, O: {...B, ...OV}, K: $Keys<O>, V: $ElementType<O, K>>(base: IDerivedDict<B>, overrider: IDerivedDict<OV>): IDerivedDict<O> {
    super()
    this._base = base
    this._overrider = overrider

    return this
  }

  _reactToHavingTappers() {
    this._untapFromBaseChanges = this._base.changes().tap((c) => {this._reactToChangeFromBase(c)})
    this._untapFromOverriderChanges = this._overrider.changes().tap((c) => {this._reactToChangeFromOverrider(c)})
  }

  _reactToNotHavingTappers() {
    this._untapFromBaseChanges()
    this._untapFromBaseChanges = _.noop
    this._untapFromOverriderChanges()
    this._untapFromOverriderChanges = _.noop
  }

  _reactToChangeFromBase(c: ChangeType<$FixMe>) {
    const keysOfOverrider = this._overrider.keys()
    const change = {
      addedKeys: _.difference(c.addedKeys, keysOfOverrider),
      deletedKeys: _.difference(c.deletedKeys, keysOfOverrider),
    }

    if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
      this._changeEmitter.emit(change)
  }

  _reactToChangeFromOverrider(c: ChangeType<$FixMe>) {
    const keysOfBase = this._base.keys()
    const change = {
      addedKeys: _.difference(c.addedKeys, keysOfBase),
      deletedKeys: _.difference(c.deletedKeys, keysOfBase),
    }
    if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
      this._changeEmitter.emit(change)
  }

  prop<K: $Keys<$FixMe>>(k: K): IDerivation<$FixMe> {
    return this._overrider.prop(k).flatMap((v) => v ? v : this._base.prop(k))
  }

  keys() {
    return _.uniq([...this._base.keys(), ...this._overrider.keys()])
  }
}

export default function extend<B: {}, OV: {}, O: {...B, ...OV}>(base: IDerivedDict<B>, overrider: IDerivedDict<OV>): IDerivedDict<O> {
  return new ExtendDerivedDict(base, overrider)
}