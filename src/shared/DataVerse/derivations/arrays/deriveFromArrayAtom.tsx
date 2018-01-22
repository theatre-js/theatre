// @flow
import {IDerivedArray} from './types'
import {ArrayAtom} from '$shared/DataVerse/atoms/array'
import AbstractDerivedArray from './AbstractDerivedArray'
import {ensureNoAtoms} from '../dicts/utils'
import noop from 'lodash/noop'

export class DerivedArrayFromArrayAtom<V> extends AbstractDerivedArray
  implements IDerivedArray<$FixMe> {
  _arrayAtom: ArrayAtom<$FixMe>
  _untapFromArrayAtomChangeEmitter: () => void

  constructor(a: ArrayAtom<V>) {
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

export default function deriveFromArrayAtom<V, A extends ArrayAtom<V>>(a: A): IDerivedArray<V> {
  return new DerivedArrayFromArrayAtom(a)
}
