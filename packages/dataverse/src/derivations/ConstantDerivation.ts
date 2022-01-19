import AbstractDerivation from './AbstractDerivation'

/**
 * A derivation whose value never changes.
 */
export default class ConstantDerivation<V> extends AbstractDerivation<V> {
  private readonly _v: V

  /**
   * @param v The value of the derivation.
   */
  constructor(v: V) {
    super()
    this._v = v
    return this
  }

  /**
   * @internal
   */
  _recalculate() {
    return this._v
  }

  /**
   * @internal
   */
  _reactToDependencyBecomingStale() {}
}
