import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './IDerivation'

// Exporting from a function because of the circular dependency with AbstractDerivation
const makeMapDerivationClass = () =>
  // TODO once prism and AbstractDerivation are merged into one, we should delete this file
  class MapDerivation<T, V> extends AbstractDerivation<V> {
    constructor(
      private readonly _dep: IDerivation<T>,
      private readonly _fn: (t: T) => V,
    ) {
      super()
      this._addDependency(_dep)
    }

    _recalculate() {
      return this._fn(this._dep.getValue())
    }

    _reactToDependencyBecomingStale() {}
  }

let cls: ReturnType<typeof makeMapDerivationClass> | undefined = undefined

export default function map<V, R>(
  dep: IDerivation<V>,
  fn: (v: V) => R,
): IDerivation<R> {
  if (!cls) {
    cls = makeMapDerivationClass()
  }
  return new cls(dep, fn)
}
