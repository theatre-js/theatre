import AbstractDerivedDict from '$shared/DataVerse/deprecated/atomDerivations/dicts/AbstractDerivedDict'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

const noop = () => {}

export class KeysOfDerivedDictDerivation<O> extends AbstractDerivation<
  Array<keyof O>
> {
  static displayName = 'keysOfDerivedDict'

  _hot: boolean
  _currentKeys: Array<keyof O>
  _untapFromDerivedDictChanges: () => void

  constructor(readonly _derivedDict: AbstractDerivedDict<O>) {
    super()
    this._hot = false
    this._currentKeys = []
    this._untapFromDerivedDictChanges = noop

    return this
  }

  _recalculate() {
    return this._derivedDict.keys()
  }

  _keepUptodate() {
    this._hot = true
    this._currentKeys = this._derivedDict.keys()
    this._untapFromDerivedDictChanges = this._derivedDict.changes().tap(() => {
      this._youMayNeedToUpdateYourself(this)
    })
    this.getValue()
  }

  _stopKeepingUptodate() {
    this._hot = false
    this._untapFromDerivedDictChanges()
    this._untapFromDerivedDictChanges = noop
  }
}

export default function keysOfDerivedDict<O, D extends AbstractDerivedDict<O>>(
  d: D,
): KeysOfDerivedDictDerivation<O> {
  return new KeysOfDerivedDictDerivation(d)
}
