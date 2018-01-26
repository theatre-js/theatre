import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'
import {collectObservedDependencies} from './discoveryMechanism'

export class AutoDerivation<V> extends AbstractDerivation<V> {
  _dependencies: Set<AbstractDerivation<mixed>>

  constructor(readonly _fn: () => V) {
    super()
  }

  _recalculate() {
    let value: V
    const newDeps: Set<AbstractDerivation<mixed>> = collectObservedDependencies(
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

    // @ts-ignore
    return value
  }

  _keepUptodate() {
    this.getValue()
  }
}

export default function autoDerive<T>(fn: () => T) {
  return new AutoDerivation(fn)
}
