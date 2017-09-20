// @flow
import Derivation from './Derivation'
import type {IArrayAtom} from '$shared/DataVerse'

const noop = () => {}

export default class DerivationOfAnIndexOfAnArrayAtom extends Derivation {
  _arrayAtom: IArrayAtom<Object>
  _untapFromMapAtomChanges: Function
  _index: number | string

  constructor(mapAtom: IArrayAtom<Object>, index: number | string) {
    super()
    this._arrayAtom = mapAtom
    this._index = index
    this._untapFromMapAtomChanges = noop
  }

  getValue() {
    this._isUptodate = true
    return this._recalculate()
  }

  _recalculate() {
    return this._arrayAtom.index((this._index: $FixMe))
  }

  _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
    if (peopleCare) {
      this.getValue()
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
    } else {
      this._untapFromMapAtomChanges()
      this._untapFromMapAtomChanges = noop
    }
  }
}