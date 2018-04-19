import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {BoxAtom} from '$shared/DataVerse/atoms/boxAtom'
import noop from '$shared/utils/noop'

export class DerivationOfABoxAtom<V> extends AbstractDerivation<V> {
  _boxAtom: BoxAtom<V>
  _untapFromBoxAtomChanges: Function

  constructor(boxAtom: BoxAtom<V>) {
    super()
    this._boxAtom = boxAtom
    this._untapFromBoxAtomChanges = noop
    return this
  }

  _recalculate() {
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

export default function deriveFromBoxAtom<V, B extends BoxAtom<V>>(
  b: B,
): AbstractDerivation<V> {
  return new DerivationOfABoxAtom(b)
}
