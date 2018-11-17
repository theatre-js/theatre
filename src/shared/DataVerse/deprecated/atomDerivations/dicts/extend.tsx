import AbstractDerivedDict, {DerivedDictChangeType} from './AbstractDerivedDict'
import * as _ from '$shared/utils'

export class ExtendDerivedDict<L, R> extends AbstractDerivedDict<Spread<L, R>> {
  _base: AbstractDerivedDict<L>
  _overrider: AbstractDerivedDict<R>
  _S: Spread<L, R>

  _untapFromBaseChanges: () => void
  _untapFromOverriderChanges: () => void

  constructor(base: AbstractDerivedDict<L>, overrider: AbstractDerivedDict<R>) {
    super()
    this._base = base
    this._overrider = overrider
    this._untapFromBaseChanges = _.noop
    this._untapFromOverriderChanges = _.noop

    return this
  }

  _reactToHavingTappers() {
    this._untapFromBaseChanges = this._base.changes().tap(c => {
      this._reactToChangeFromBase(c)
    })
    this._untapFromOverriderChanges = this._overrider.changes().tap(c => {
      this._reactToChangeFromOverrider(c)
    })
  }

  _reactToNotHavingTappers() {
    this._untapFromBaseChanges()
    this._untapFromBaseChanges = _.noop
    this._untapFromOverriderChanges()
    this._untapFromOverriderChanges = _.noop
  }

  _reactToChangeFromBase(c: DerivedDictChangeType<L>) {
    const keysOfOverrider = this._overrider.keys()
    const change = {
      addedKeys: _.difference(c.addedKeys, keysOfOverrider as $IntentionalAny),
      deletedKeys: _.difference(
        c.deletedKeys,
        keysOfOverrider as $IntentionalAny,
      ),
    }

    if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
      this._changeEmitter.emit(change as $IntentionalAny)
  }

  _reactToChangeFromOverrider(c: DerivedDictChangeType<R>) {
    const keysOfBase = this._base.keys()
    const change = {
      addedKeys: _.difference(c.addedKeys, keysOfBase as $IntentionalAny),
      deletedKeys: _.difference(c.deletedKeys, keysOfBase as $IntentionalAny),
    }
    if (change.addedKeys.length > 0 || change.deletedKeys.length > 0)
      this._changeEmitter.emit(change as $IntentionalAny)
  }

  prop<K extends keyof this['_S']>(key: K) {
    return this._overrider
      .prop(key as $IntentionalAny)
      .flatMap(
        (v: $IntentionalAny) =>
          v !== undefined ? v : this._base.prop(key as $IntentionalAny),
      )
  }

  keys() {
    return _.uniq([
      ...this._base.keys(),
      ...this._overrider.keys(),
    ]) as $IntentionalAny
  }
}

export default function extend<L, R>(
  base: AbstractDerivedDict<L>,
  overrider: AbstractDerivedDict<R>,
): ExtendDerivedDict<L, R> {
  return new ExtendDerivedDict(base, overrider)
}
