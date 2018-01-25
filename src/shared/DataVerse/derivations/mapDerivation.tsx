
import AbstractDerivation from './AbstractDerivation'

// type Deps<O> = $ObjMap<O, <V>(v: V) => AbstractDerivation<V>>

export class MapDerivation<T, V> extends AbstractDerivation<V> {
  getValue: () => V
  _fn: $FixMe
  _dep: AbstractDerivation<T>

  constructor(dep: AbstractDerivation<T>, fn: (t: T) => V) {
    super()
    this._dep = dep
    this._fn = fn

    this._addDependency(dep)
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
