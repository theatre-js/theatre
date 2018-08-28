import AbstractDerivation from '../AbstractDerivation'
import {DictAtom} from '$shared/DataVerse/atoms/dictAtom'

const noop = () => {}

export class DerivationOfAPropOfADictAtom<V> extends AbstractDerivation<V> {
  _dictAtom: DictAtom<$IntentionalAny>
  _untapFromDictAtomChanges: Function
  _propName: $IntentionalAny

  constructor(dictAtom: DictAtom<V>, propName: $IntentionalAny) {
    super()
    this._dictAtom = dictAtom
    this._propName = propName
    this._untapFromDictAtomChanges = noop
  }

  _recalculate() {
    return this._dictAtom.prop(this._propName)
  }

  _keepUptodate() {
    this._untapFromDictAtomChanges = this._dictAtom.changes().tap(changes => {
      if (
        changes.overriddenRefs.hasOwnProperty(this._propName) ||
        changes.deletedKeys.indexOf(this._propName) !== -1
      )
        this._youMayNeedToUpdateYourself(this as $IntentionalAny)
    })
  }

  stopKeepingUptodate() {
    this._untapFromDictAtomChanges()
    this._untapFromDictAtomChanges = noop
  }
}

export default function deriveFromPropOfADictAtom<O, K extends keyof O>(
  dict: DictAtom<O>,
  key: K,
): AbstractDerivation<O[K]> {
  // @ts-ignore ignore
  return new DerivationOfAPropOfADictAtom(dict, key)
}
