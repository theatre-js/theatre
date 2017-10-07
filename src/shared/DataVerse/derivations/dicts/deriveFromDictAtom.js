// @flow
import type {IDictAtom} from '$shared/DataVerse/atoms/dict'
import type {IDerivedDict} from './types'
import DerivedDict from './AbstractDerivedDict'
import noop from 'lodash/noop'
// import type {IDerivation} from '../types'

const ensureNoAtoms = (d: mixed) => {
  if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
    if (d.isDictAtom === true) {
      return deriveFromDictAtom((d: $FixMe))
    } else if (d.isArrayAtom === true) {
      throw new Error(`Unimplemented`)
    } else if (d instanceof DerivedDict) {
      return d
    } else {
      console.warn('check this')
      return d
    }
  } else {
    return d
  }
}

export class DerivedDictFromDictAtom<O: {}> extends DerivedDict implements IDerivedDict<$FixMe> {
  _mapAtom: IDictAtom<O>
  prop: $FixMe
  changes: $FixMe
  _untapFromDictAtomChangeEmitter: () => void

  constructor(m: IDictAtom<O>): IDerivedDict<$FixMe> {
    super()
    this._mapAtom = m
    this._untapFromDictAtomChangeEmitter = noop
    return this
  }

  prop(k: $Keys<O>) {
    const b = this._mapAtom.pointer().prop(k).flatMap(ensureNoAtoms)
    // if (k === '0') {
    //   b.unpropable = true
    //   debugger
    // }
    return b
  }

  _reactToHavingTappers() {
    this._untapFromDictAtomChangeEmitter = this._mapAtom.changes().tap((c) => {
      if (c.addedKeys.length > 0 || c.deletedKeys.length > 0)
        this._changeEmitter.emit({addedKeys: c.addedKeys, deletedKeys: c.deletedKeys})
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromDictAtomChangeEmitter()
    this._untapFromDictAtomChangeEmitter = noop
  }

  keys() {
    return this._mapAtom.keys()
  }
}

export default function deriveFromDictAtom<O: {}>(m: IDictAtom<O>): IDerivedDict<$FixMe> {
  return new DerivedDictFromDictAtom(m)
}