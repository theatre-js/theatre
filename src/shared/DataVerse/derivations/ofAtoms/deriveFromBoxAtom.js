// @flow
import AbstractDerivation from '../AbstractDerivation'
import type {IBoxAtom} from '$shared/DataVerse'
import type {IDerivation} from '../types'

const noop = () => {}

export class DerivationOfABoxAtom<V> extends AbstractDerivation
  implements IDerivation<V> {
  getValue: () => V

  _boxAtom: IBoxAtom<V>
  _untapFromBoxAtomChanges: Function

  constructor(boxAtom: IBoxAtom<V>): IDerivation<V> {
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

export default function deriveFromBoxAtom<V, B: IBoxAtom<V>>(
  b: B,
): IDerivation<V> {
  return new DerivationOfABoxAtom(b)
}
