import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import noop from '$shared/utils/noop'
import {Atom} from './atom'

export class IdentityDerivation<V> extends AbstractDerivation<V> {
  _untapFromChanges: Function
  _hot: boolean
  _cachedValue: undefined | V
  _hasCachedValue: boolean

  constructor(
    readonly _root: Atom<mixed>,
    readonly _path: Array<string | number>,
  ) {
    super()
    this._untapFromChanges = noop
    this._cachedValue = undefined
    this._hasCachedValue = false
  }

  _recalculate() {
    if (this._hot) {
      if (!this._hasCachedValue) {
        this._cachedValue = this._root._getIdentityByPath(
          this._path,
        ) as $IntentionalAny
        this._hasCachedValue = true
      }
      return this._cachedValue as V
    } else {
      return this._root._getIdentityByPath(this._path) as $IntentionalAny
    }
  }

  _keepUptodate() {
    this._hot = true
    this._hasCachedValue = false
    this._cachedValue = undefined

    this._untapFromChanges = this._root._tapIntoIdentityOfPathChanges(this._path, (newIdentity) => {
      this._hasCachedValue = true
      this._cachedValue = newIdentity as $FixMe
      this._youMayNeedToUpdateYourself(this)
    })
  }

  _stopKeepingUptodate() {
    this._untapFromChanges()
    this._untapFromChanges = noop
    this._hot = false
    this._hasCachedValue = false
    this._cachedValue = undefined
  }
}
