// @flow
import Derivation from './Derivation'
import gogool from './autoDerivationGogool'

// type Deps<O> = $ObjMap<O, <V>(v: V) => Derivation<V>>

export default class AutoDerivation<V> extends Derivation<V> {
  _dependencies: *
  _fn: *

  constructor(fn: () => V) {
    super()
    this._dependencies = new Set()
    this._fn = fn
  }

  _recalculate() {
    let value
    const newDeps: Set<Derivation<$IntentionalAny>> = gogool.gool(() => {
      value = this._fn()
    })
    this._dependencies.forEach((d) => {
      if (!newDeps.has(d)) {
        d._removeDependent(this)
      }
    })
    this._dependencies = newDeps
    newDeps.forEach((d) => {
      d._addDependent(this)
    })

    return value
  }

  _onWhetherPeopleCareAboutMeStateChange(peopleCare: boolean) {
    if (peopleCare) {
      this.getValue()
    }
  }
}