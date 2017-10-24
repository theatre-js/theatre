// @flow
import type {IDerivation} from '../types'
import type {default as Tappable} from '$shared/DataVerse/utils/Tappable'

export interface IDerivedArray<V> {
  _id: number,
  index(number): IDerivation<V>,
  concat<A: Array<V>>(A): IDerivedArray<V>,
  map<T, Fn: (IDerivation<V>) => T>(Fn): IDerivedArray<T>,
  reduce<Acc, Fn: (Acc, V, number) => Acc | IDerivation<Acc>, Seed: Acc | IDerivation<Acc>>(Fn, Seed): IDerivation<Acc>,
  length(): number,
  changes(): Tappable<{startIndex: number, deleteCount: number, addCount: number}>,
}