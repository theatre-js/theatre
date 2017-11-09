// @flow
import AbstractDerivation from '../AbstractDerivation'
import type {IArrayAtom} from '$shared/DataVerse'
import type {IDerivation} from '../types'

const noop = () => {}

export class DerivationOfAnIndexOfAnArrayAtom<V> extends AbstractDerivation
  implements IDerivation<V> {
  getValue: () => V

  _arrayAtom: IArrayAtom<V>
  _untapFromDictAtomChanges: Function
  _index: number

  constructor(arrayAtom: IArrayAtom<V>, index: number): IDerivation<V> {
    super()
    this._arrayAtom = arrayAtom
    this._index = index
    this._untapFromDictAtomChanges = noop
    return this
  }

  _recalculate(): $FixMe {
    return this._arrayAtom.index((this._index: $FixMe))
  }

  _keepUptodate() {
    // this.getValue()
    this._untapFromDictAtomChanges = this._arrayAtom.changes().tap(changes => {
      if (changes.startIndex > this._index) return
      const countOfAddedItems = changes.addedRefs.length - changes.deleteCount
      if (countOfAddedItems === 0) {
        if (changes.startIndex + changes.deleteCount >= this._index) {
          this._youMayNeedToUpdateYourself(this)
        }
      } else {
        this._youMayNeedToUpdateYourself(this)
      }
    })
  }

  _stopKeepingUptodate() {
    this._untapFromDictAtomChanges()
    this._untapFromDictAtomChanges = noop
  }
}

export default function deriveFromIndexOfArrayAtom<V, A: IArrayAtom<V>>(
  a: A,
  index: number,
): IDerivation<V> {
  return new DerivationOfAnIndexOfAnArrayAtom(a, index)
}
