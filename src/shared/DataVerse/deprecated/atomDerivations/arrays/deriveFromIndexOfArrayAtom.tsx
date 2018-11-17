import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {ArrayAtom} from '$shared/DataVerse/deprecated/atoms/arrayAtom'

const noop = () => {}

export class DerivationOfAnIndexOfAnArrayAtom<V> extends AbstractDerivation<V> {
  _arrayAtom: ArrayAtom<V>
  _untapFromDictAtomChanges: Function
  _index: number

  constructor(arrayAtom: ArrayAtom<V>, index: number) {
    super()
    this._arrayAtom = arrayAtom
    this._index = index
    this._untapFromDictAtomChanges = noop
    return this
  }

  _recalculate() {
    return this._arrayAtom.index(this._index)
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

export default function deriveFromIndexOfArrayAtom<V>(
  a: ArrayAtom<V>,
  index: number,
): AbstractDerivation<V> {
  return new DerivationOfAnIndexOfAnArrayAtom(a, index)
}
