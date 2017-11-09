// @flow
import type {IDerivedArray} from './types'
import type {IArrayAtom} from '$shared/DataVerse/atoms/array'
import AbstractDerivedArray from './AbstractDerivedArray'
import {ensureNoAtoms} from '../dicts/utils'
import noop from 'lodash/noop'

export class DerivedArrayFromArrayAtom extends AbstractDerivedArray
  implements IDerivedArray<$FixMe> {
  _arrayAtom: $FixMe
  _untapFromArrayAtomChangeEmitter: () => void

  constructor<V>(a: IArrayAtom<V>): IDerivedArray<$FixMe> {
    super()
    this._arrayAtom = a
    this._untapFromArrayAtomChangeEmitter = noop
    return this
  }

  index(i: number) {
    return this._arrayAtom
      .pointer()
      .index(i)
      .flatMap(ensureNoAtoms)
  }

  _reactToHavingTappers() {
    this._untapFromArrayAtomChangeEmitter = this._arrayAtom.changes().tap(c => {
      if (c.deleteCount !== c.addedRefs.length) {
        this._changeEmitter.emit({
          startIndex: c.startIndex,
          deleteCount: c.deleteCount,
          addCount: c.addedRefs.length,
        })
      }
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromArrayAtomChangeEmitter()
    this._untapFromArrayAtomChangeEmitter = noop
  }

  length() {
    return this._arrayAtom.length()
  }
}

export default function deriveFromArrayAtom<V, A: IArrayAtom<V>>(
  a: A,
): IDerivedArray<V> {
  return new DerivedArrayFromArrayAtom(a)
}
