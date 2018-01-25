
import AbstractDerivation from '../AbstractDerivation'
import {AbstractDerivation} from '../types'
import {collectObservedDependencies} from './discoveryMechanism'

export class AutoDerivation<V> extends AbstractDerivation
  implements AbstractDerivation<V> {
  _dependencies: Set<AbstractDerivation<$IntentionalAny>>
  _fn: () => V

  constructor(fn: () => V): AbstractDerivation<V> {
    super()
    this._fn = fn
    return this
  }

  _recalculate() {
    let value: V
    const newDeps: Set<
      AbstractDerivation<$IntentionalAny>,
    > = collectObservedDependencies(
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

    return (value as $FixMe)
  }

  _keepUptodate() {
    this.getValue()
  }
}

export default function autoDerive<T>(fn: () => T): AbstractDerivation<T> {
  return new AutoDerivation(fn)
}
