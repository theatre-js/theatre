
import AbstractDerivation from './AbstractDerivation'

export class WithDepsDerivation<
  V,
  O extends {[key: string]: AbstractDerivation<mixed>}
> extends AbstractDerivation<V> {
  constructor(readonly _deps: O, readonly _fn: (dependencies: O) => V) {
    super()

    for (let dependencyKey in _deps) {
      this._addDependency(_deps[dependencyKey])
    }
  }

  _recalculate() {
    return this._fn(this._deps)
  }
}

export default function withDeps<
  V,
  O extends {[key: string]: AbstractDerivation<mixed>}
>(deps: O, fn: (dependencies: O) => V): AbstractDerivation<V> {
  return new WithDepsDerivation(deps, fn)
}
