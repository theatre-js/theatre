// @flow
import {AbstractDerivation} from '../types'
import {default as Tappable} from '$shared/DataVerse/utils/Tappable'

export interface IDerivedArray<V> {
  _id: number
  index(i: number): AbstractDerivation<V>
  concat<A extends Array<V>>(A): IDerivedArray<V>
  map<T, Fn extends ((d: AbstractDerivation<V>) => T)>(fn: Fn): IDerivedArray<T>
  reduce<
    Acc,
    Fn extends ((acc: Acc, v: V, n: number) => Acc | AbstractDerivation<Acc>),
    Seed extends Acc | AbstractDerivation<Acc>
  >(
    fn: Fn,
    seed: Seed,
  ): AbstractDerivation<Acc>
  length(): number
  changes(): Tappable<{
    startIndex: number
    deleteCount: number
    addCount: number
  }>
  toJS(): AbstractDerivation<Array<V>>
}
