// @flow
import {IDerivation} from '../types'
import {default as Tappable} from '$shared/DataVerse/utils/Tappable'

export interface IDerivedArray<V> {
  _id: number
  index(i: number): IDerivation<V>
  concat<A extends Array<V>>(A): IDerivedArray<V>
  map<T, Fn extends ((d: IDerivation<V>) => T)>(fn: Fn): IDerivedArray<T>
  reduce<
    Acc,
    Fn extends ((acc: Acc, v: V, n: number) => Acc | IDerivation<Acc>),
    Seed extends Acc | IDerivation<Acc>
  >(
    fn: Fn,
    seed: Seed,
  ): IDerivation<Acc>
  length(): number
  changes(): Tappable<{
    startIndex: number
    deleteCount: number
    addCount: number
  }>
  toJS(): IDerivation<Array<V>>
}
