import AbstractDerivation from '../AbstractDerivation'
import {IBoxAtom} from '$shared/DataVerse'
import {AbstractDerivation} from '../types'

const noop = () => {}

export class DerivationOfABoxAtom<V> extends AbstractDerivation<V> {
  _boxAtom: IBoxAtom<V>
  _untapFromBoxAtomChanges: Function

  constructor(boxAtom: IBoxAtom<V>) {
    super()
    this._boxAtom = boxAtom
    this._untapFromBoxAtomChanges = noop
    return this
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

export default function deriveFromBoxAtom<V, B extends IBoxAtom<V>>(
  b: B,
): AbstractDerivation<V> {
  return new DerivationOfABoxAtom(b)
}
