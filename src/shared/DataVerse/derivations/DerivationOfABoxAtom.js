// @flow
import Derivation from './Derivation'
import type {IBoxAtom} from '$shared/DataVerse'

const noop = () => {}

export default class DerivationOfABoxAtom extends Derivation {
  _boxAtom: IBoxAtom<any>
  _untapFromBoxAtomChanges: Function

  constructor(boxAtom: IBoxAtom<any>) {
    super()
    this._boxAtom = boxAtom
    this._untapFromBoxAtomChanges = noop
  }

  getValue() {
    //
    this._isUptodate = true
    return this._recalculate()
  }

  _recalculate() {
    return this._boxAtom.unbox()
  }

  _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
    if (peopleCare) {
      this._untapFromBoxAtomChanges = this._boxAtom.changes().tap(() => {
        this._youMayNeedToUpdateYourself()
      })
    } else {
      this._untapFromBoxAtomChanges()
      this._untapFromBoxAtomChanges = noop
    }
  }
}