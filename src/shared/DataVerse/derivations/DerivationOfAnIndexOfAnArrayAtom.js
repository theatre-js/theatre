// @flow
import Derivation from './Derivation'
import type {IArrayAtom, IAtom} from '$shared/DataVerse'

const noop = () => {}

export default class DerivationOfAnIndexOfAnArrayAtom<V: IAtom> extends Derivation<V> {
  _arrayAtom: IArrayAtom<V>
  _untapFromMapAtomChanges: Function
  _index: number

  constructor(arrayAtom: IArrayAtom<V>, index: number) {
    super()
    this._arrayAtom = arrayAtom
    this._index = index
    this._untapFromMapAtomChanges = noop
  }

  _recalculate(): $FixMe {
    return this._arrayAtom.index((this._index: $FixMe))
  }

  _keepUptodate() {
    // this.getValue()
    this._untapFromMapAtomChanges = this._arrayAtom.changes().tap((changes) => {
      if (changes.startIndex > this._index) return
      const countOfAddedItems = changes.addedRefs.length - changes.deleteCount
      if (countOfAddedItems === 0) {
        if (changes.startIndex + changes.deleteCount >= this._index) {
          this._youMayNeedToUpdateYourself()
        }
      } else {
        this._youMayNeedToUpdateYourself()
      }
    })
  }

  stopKeepingUptodate() {
    this._untapFromMapAtomChanges()
    this._untapFromMapAtomChanges = noop
  }
}