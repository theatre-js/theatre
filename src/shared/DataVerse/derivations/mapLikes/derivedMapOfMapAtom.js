// @flow
import type {IMapAtom} from '$shared/DataVerse/atoms/MapAtom'
import type {IDerivedMap} from './types'
import DerivedMap from './DerivedMap'
import noop from 'lodash/noop'
// import type {IDerivation} from '../types'

const ensureNoAtoms = (d: mixed) => {
  if (typeof d === 'object' && d !== null && !Array.isArray(d)) {
    if (d.isMapAtom === true) {
      return derivedMapOfMapAtom((d: $FixMe))
    } else if (d.isArrayAtom === true) {
      throw new Error(`Unimplemented`)
    } else {
      console.warn('check this')
      return d
    }
  } else {
    return d
  }
}

export class DerivedMapOfMapAtom<O: {}> extends DerivedMap implements IDerivedMap<$FixMe> {
  _mapAtom: IMapAtom<O>
  prop: $FixMe
  changes: $FixMe
  _untapFromMapAtomChangeEmitter: () => void

  constructor(m: IMapAtom<O>): IDerivedMap<$FixMe> {
    super()
    this._mapAtom = m
    this._untapFromMapAtomChangeEmitter = noop
    return this
  }

  prop(k: $Keys<O>) {
    return this._mapAtom.pointer().prop(k).flatMap(ensureNoAtoms)
  }

  _reactToHavingTappers() {
    this._untapFromMapAtomChangeEmitter = this._mapAtom.changes().tap((c) => {
      if (c.addedKeys.length > 0 || c.deletedKeys.length > 0)
        this._changeEmitter.emit({addedKeys: c.addedKeys, deletedKeys: c.deletedKeys})
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromMapAtomChangeEmitter()
    this._untapFromMapAtomChangeEmitter = noop
  }

  keys() {
    return this._mapAtom.keys()
  }
}

export default function derivedMapOfMapAtom<O: {}>(m: IMapAtom<O>): IDerivedMap<$FixMe> {
  return new DerivedMapOfMapAtom(m)
}