// @flow
import Derivation from '../Derivation'
import type {IBoxAtom} from '$shared/DataVerse'

const noop = () => {}

export default class DerivationOfABoxAtom<V> extends Derivation<V> {
  _boxAtom: IBoxAtom<V>
  _untapFromBoxAtomChanges: Function

  constructor(boxAtom: IBoxAtom<V>) {
    super()
    this._boxAtom = boxAtom
    this._untapFromBoxAtomChanges = noop
  }

  _recalculate(): $FixMe {
    return this._boxAtom.getValue()
  }

  _keepUptodate() {
    this._untapFromBoxAtomChanges = this._boxAtom.changes().tap(() => {
      this._youMayNeedToUpdateYourself(this)
    })
  }

  _stopKeepingUptodate() {
    this._untapFromBoxAtomChanges()
    this._untapFromBoxAtomChanges = noop
  }
}