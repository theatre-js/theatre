// @flow
import AbstractDerivation from '../AbstractDerivation'
import type {IDictAtom} from '$shared/DataVerse'
import type {IDerivation} from '../types'

const noop = () => {}

export class DerivationOfAPropOfADictAtom<O: {}> extends AbstractDerivation
  implements IDerivation<$FixMe> {
  _dictAtom: IDictAtom<O>
  _untapFromDictAtomChanges: Function
  _propName: $Keys<O>

  constructor(dictAtom: IDictAtom<O>, propName: $Keys<O>) {
    super()
    this._dictAtom = dictAtom
    this._propName = propName
    this._untapFromDictAtomChanges = noop
  }

  _recalculate() {
    return this._dictAtom.prop((this._propName: $FixMe))
  }

  _keepUptodate() {
    this._untapFromDictAtomChanges = this._dictAtom.changes().tap(changes => {
      if (
        changes.overriddenRefs.hasOwnProperty(this._propName) ||
        changes.deletedKeys.indexOf(this._propName) !== -1
      )
        this._youMayNeedToUpdateYourself(this)
    })
  }

  stopKeepingUptodate() {
    this._untapFromDictAtomChanges()
    this._untapFromDictAtomChanges = noop
  }
}

export default function deriveFromPropOfADictAtom<O: {}, M: IDictAtom<O>, K: $Keys<O>>(
  m: M,
  propName: $Keys<O>,
): IDerivation<$ElementType<O, K>> {
  return new DerivationOfAPropOfADictAtom(m, propName)
}
