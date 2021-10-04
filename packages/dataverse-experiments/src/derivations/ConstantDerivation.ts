import AbstractDerivation from './AbstractDerivation'

export default class ConstantDerivation<V> extends AbstractDerivation<V> {
  _v: V

  constructor(v: V) {
    super()
    this._v = v
    return this
  }

  _recalculate() {
    return this._v
  }

  _reactToDependencyBecomingStale() {}
}
