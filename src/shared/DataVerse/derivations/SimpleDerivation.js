// @flow
import Derivation from './Derivation'

type Deps<O> = $ObjMap<O, <V>(v: V) => Derivation<V>>

export default class SimpleDerivation<V, O: {}> extends Derivation<V> {
  _deps: Deps<O>
  _fn: *

  constructor(dependencies: Deps<O>, fn: (dependencies: O) => V) {
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