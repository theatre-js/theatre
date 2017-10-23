// @flow
import type {IDerivation} from '../types'

export interface IDerivedArray<V> {
  _id: number,
  concat<A: Array<V>>(A): IDerivedArray<V>,
  map<T, Fn: (V) => T>(Fn): IDerivedArray<T>,
  reduce<Acc, Fn: (Acc, V, number) => Acc, Seed: Acc>(Fn, Seed): IDerivation<Acc>,
}