// @flow
import type {IDictAtom} from '$shared/DataVerse/atoms/dict'
import type {IDerivedDict} from './types'
import AbstractDerivedDict from './AbstractDerivedDict'
import noop from 'lodash/noop'
// import AbstractDerivation from '../AbstractDerivation'
import {ensureNoAtoms} from './utils'

export class DerivedDictFromDictAtom<O: {}> extends AbstractDerivedDict implements IDerivedDict<$FixMe> {
  _dictAtom: IDictAtom<O>
  prop: $FixMe
  changes: $FixMe
  _untapFromDictAtomChangeEmitter: () => void

  constructor(m: IDictAtom<O>): IDerivedDict<$FixMe> {
    super()
    this._dictAtom = m
    this._untapFromDictAtomChangeEmitter = noop
    return this
  }

  prop(k: $Keys<O>) {
    return this._dictAtom.pointer().prop(k).flatMap(ensureNoAtoms)
  }

  _reactToHavingTappers() {
    this._untapFromDictAtomChangeEmitter = this._dictAtom.changes().tap((c) => {
      if (c.addedKeys.length > 0 || c.deletedKeys.length > 0)
        this._changeEmitter.emit({addedKeys: c.addedKeys, deletedKeys: c.deletedKeys})
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromDictAtomChangeEmitter()
    this._untapFromDictAtomChangeEmitter = noop
  }

  keys() {
    return this._dictAtom.keys()
  }
}

export default function deriveFromDictAtom<O: {}>(m: IDictAtom<O>): IDerivedDict<$FixMe> {
  return new DerivedDictFromDictAtom(m)
}