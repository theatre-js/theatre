// @flow
import AbstractDerivation from './AbstractDerivation'
import {AbstractDerivation} from './types'

// type Deps<O> = $ObjMap<O, <V>(v: V) => AbstractDerivation<V>>

export class WithDepsDerivation<V, O> extends AbstractDerivation
  implements AbstractDerivation<V> {
  getValue: () => V

  _deps: O
  _fn: $FixMe

  constructor(dependencies: O, fn: (dependencies: O) => V) {
    super()
    this._deps = dependencies
    this._fn = fn

    for (let dependencyKey in dependencies) {
      this._addDependency(dependencies[dependencyKey])
    }
  }

  _recalculate() {
    return this._fn(this._deps)
  }
}

export default function withDeps<V, O>(
  deps: O,
  fn: (dependencies: O) => V,
): AbstractDerivation<V> {
  return new WithDepsDerivation(deps, fn)
}
