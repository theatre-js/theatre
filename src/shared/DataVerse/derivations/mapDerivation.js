// @flow
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

// type Deps<O> = $ObjMap<O, <V>(v: V) => IDerivation<V>>

export class MapDerivation<T, V> extends AbstractDerivation implements IDerivation<V> {
  getValue: () => V
  _fn: *
  _dep: IDerivation<T>

  constructor(dep: IDerivation<T>, fn: (T) => V) {
    super()
    this._dep = dep
    this._fn = fn

    this._addDependency(dep)
  }

  _recalculate() {
    return this._fn(this._dep.getValue())
  }
}

export default function mapDerivation<V, T>(dep: IDerivation<V>, fn: (V) => T): IDerivation<T> {
  return new MapDerivation(dep, fn)
}