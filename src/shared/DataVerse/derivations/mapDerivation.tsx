import AbstractDerivation from './AbstractDerivation'

export class MapDerivation<
  T,
  V,
  Fn extends (t: T) => V
> extends AbstractDerivation<V> {
  constructor(readonly _dep: AbstractDerivation<T>, readonly _fn: Fn) {
    super()
    this._addDependency(_dep)
  }

  _recalculate() {
    return this._fn(this._dep.getValue())
  }
}

export default function mapDerivation<V, T>(
  dep: AbstractDerivation<V>,
  fn: (v: V) => T,
) {
  return new MapDerivation(dep, fn)
}
