// @flow
import Derivation from './Derivation'

export default class SimpleDerivation extends Derivation {
  _dependencies: *
  _fn: *

  constructor(dependencies: Object, fn: (dependencies: Object) => mixed) {
    super()
    this._dependencies = dependencies
    this._fn = fn

    for (let dependencyKey in dependencies) {
      dependencies[dependencyKey]._addDependent(this)
    }
  }

  _recalculate() {
    return this._fn(this._dependencies)
  }
}