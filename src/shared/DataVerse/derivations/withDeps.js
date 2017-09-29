// @flow
import Derivation from './Derivation'
import type {IDerivation} from './types'

// type Deps<O> = $ObjMap<O, <V>(v: V) => IDerivation<V>>

export class WithDepsDerivation<V, O: {}> extends Derivation implements IDerivation<V> {
  getValue: () => V

  _deps: O
  _fn: *

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

export default function withDeps<V, O: {[key: mixed]: IDerivation<*>}>(deps: O, fn: (dependencies: O) => V): IDerivation<V> {
  return new WithDepsDerivation(deps, fn)
}