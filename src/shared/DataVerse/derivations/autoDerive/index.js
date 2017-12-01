// @flow
import AbstractDerivation from '../AbstractDerivation'
import type {IDerivation} from '../types'
import {collectObservedDependencies} from './discoveryMechanism'

export class AutoDerivation<V> extends AbstractDerivation implements IDerivation<V> {
  _dependencies: Set<IDerivation<$IntentionalAny>>
  _fn: () => V

  constructor(fn: () => V): IDerivation<V> {
    super()
    this._fn = fn
    return this
  }

  _recalculate() {
    let value: V
    const newDeps: Set<IDerivation<$IntentionalAny>> = collectObservedDependencies(
      () => {
        value = this._fn()
      },
      observedDep => {
        this._addDependency(observedDep)
      },
    )

    this._dependencies.forEach(d => {
      if (!newDeps.has(d)) {
        this._removeDependency(d)
      }
    })

    this._dependencies = newDeps
    // newDeps.forEach(d => {
    //   this._addDependency(d)
    // })

    return (value: $FixMe)
  }

  _keepUptodate() {
    this.getValue()
  }
}

export default function autoDerive<T>(fn: () => T): IDerivation<T> {
  return new AutoDerivation(fn)
}
