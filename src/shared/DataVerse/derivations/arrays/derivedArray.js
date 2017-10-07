// @flow
import type {IDerivation} from '../types'
let lastId: number = 0

export interface IDerivedArray<V> {
  _id: number,
  concat<A: Array<V>>(A): IDerivedArray<V>,
  map<T, Fn: (V) => T>(Fn): IDerivedArray<T>,
  reduce<Acc, Fn: (Acc, V, number) => Acc, Seed: Acc>(Fn, Seed): IDerivation<Acc>,
}

export class DerivedArray {
  _id: number
  constructor() {
    this._id = lastId++
  }
}

export default function derivedArray<V, A: Array<V>>(a: A) {
  return new DerivedArray()
}