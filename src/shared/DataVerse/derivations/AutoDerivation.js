// @flow
import Derivation from './Derivation'
import {collectObservedDependencies} from './autoDerivationDependentDiscoveryMechanism'

export default class AutoDerivation<V> extends Derivation<V> {
  _dependencies: *
  _fn: *

  constructor(fn: () => V) {
    super()
    this._fn = fn
  }

  _recalculate() {
    let value
    const newDeps: Set<Derivation<$IntentionalAny>> = collectObservedDependencies(() => {
      value = this._fn()
    })
    this._dependencies.forEach((d) => {
      if (!newDeps.has(d)) {
        this._removeDependency(d)
      }
    })
    this._dependencies = newDeps
    newDeps.forEach((d) => {
      this._addDependency(d)
    })

    return value
  }

  _keepUptodate() {
    this.getValue()
  }
}