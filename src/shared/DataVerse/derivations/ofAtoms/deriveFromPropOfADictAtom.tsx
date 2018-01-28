import AbstractDerivation from '../AbstractDerivation'
import {IDictAtom} from '$shared/DataVerse'

const noop = () => {}

export class DerivationOfAPropOfADictAtom<O> extends AbstractDerivation<
  $FixMe
> {
  _dictAtom: IDictAtom<O>
  _untapFromDictAtomChanges: Function
  _propName: keyof O

  constructor(dictAtom: IDictAtom<O>, propName: keyof O) {
    super()
    this._dictAtom = dictAtom
    this._propName = propName
    this._untapFromDictAtomChanges = noop
  }

  _recalculate() {
    return this._dictAtom.prop(this._propName as $FixMe)
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

export default function deriveFromPropOfADictAtom<
  O,
  M extends IDictAtom<O>,
  K extends keyof O
>(m: M, propName: keyof O): AbstractDerivation<O[K]> {
  return new DerivationOfAPropOfADictAtom(m, propName)
}
