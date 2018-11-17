import AbstractDerivedDict from './AbstractDerivedDict'
import noop from '$shared/utils/noop'
import {ensureNoAtoms} from './utils'
import {DictAtom} from '$shared/DataVerse/atomsDeprecated/dictAtom'

export class DerivedDictFromDictAtom<O> extends AbstractDerivedDict<O> {
  _dictAtom: DictAtom<O>
  isDerivedFromDictAtom = true

  _untapFromDictAtomChangeEmitter: () => void

  constructor(m: DictAtom<O>) {
    super()
    this._dictAtom = m
    this._untapFromDictAtomChangeEmitter = noop
    return this
  }

  prop(key: keyof O) {
    return this._dictAtom
      .pointer()
      .prop(key)
      .flatMap(ensureNoAtoms)
  }

  _reactToHavingTappers() {
    this._untapFromDictAtomChangeEmitter = this._dictAtom.changes().tap(c => {
      if (c.addedKeys.length > 0 || c.deletedKeys.length > 0)
        this._changeEmitter.emit({
          addedKeys: c.addedKeys,
          deletedKeys: c.deletedKeys,
        })
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromDictAtomChangeEmitter()
    this._untapFromDictAtomChangeEmitter = noop
  }

  keys() {
    return this._dictAtom.keys()
  }
}

export default function deriveFromDictAtom<O>(
  m: DictAtom<O>,
): DerivedDictFromDictAtom<O> {
  return new DerivedDictFromDictAtom(m)
}
