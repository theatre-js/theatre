// @flow
import Derivation from '../Derivation'
import type {IMapAtom} from '$shared/DataVerse'
import type {IDerivation} from '../types'

const noop = () => {}

export class DerivationOfAPropOfAMapAtom extends Derivation implements IDerivation<$FixMe> {
  _mapAtom: IMapAtom<$FixMe>
  _untapFromMapAtomChanges: Function
  _propName: string | number

  constructor(mapAtom: IMapAtom<$FixMe>, propName: string | number) {
    super()
    this._mapAtom = mapAtom
    this._propName = propName
    this._untapFromMapAtomChanges = noop
  }

  _recalculate() {
    return this._mapAtom.prop((this._propName: $FixMe))
  }

  _keepUptodate() {
    this._untapFromMapAtomChanges = this._mapAtom.changes().tap((changes) => {
      if (changes.overriddenRefs.hasOwnProperty(this._propName) || changes.deletedKeys.indexOf(this._propName) !== -1)
        this._youMayNeedToUpdateYourself(this)
    })
  }

  stopKeepingUptodate() {
    this._untapFromMapAtomChanges()
    this._untapFromMapAtomChanges = noop

  }
}

export default function deriveFromPropOfAMapAtom<O: {}, M: IMapAtom<O>, K: $Keys<O>>(m: M, propName: $Keys<O>): IDerivation<$ElementType<O, K>> {
  return new DerivationOfAPropOfAMapAtom(m, propName)
}