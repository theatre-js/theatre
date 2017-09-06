// @flow

declare module 'lodash/flatten' {
  declare type DeepArrayOf<T> = Array<T | DeepArrayOf<T>>
  declare module.exports: (<T>(input: DeepArrayOf<T>) => Array<T>)
}

declare module 'lodash/reduceRight' {
  declare type _Iteratee<AccumulatorType, ItemType, IndexType> = (acc: AccumulatorType, value: ItemType, key: IndexType) => AccumulatorType
  // @todo: add support for object collection
  // @todo: add support for identity iteratee
  declare module.exports: (
    (<AccumulatorType, ItemType, Iteratee: _Iteratee<AccumulatorType, ItemType, number>>(collection: Array<ItemType>, iteratee: Iteratee, acc: ?AccumulatorType) => AccumulatorType)
  )
}

declare module 'lodash/forEachRight' {
  declare type _Iteratee<ValueType, KeyType> = (value: ValueType, key: KeyType) => ?boolean
  // @todo: add support for object collection
  declare module.exports: (
    (<ValueType, KeyType, Iteratee: _Iteratee<ValueType, KeyType>>(collection: Array<ValueType>, iteratee: ?Iteratee) => Array<ValueType>)
  )
}

// declare module 'lodash/forEach' {
//   declare type ForEachObjectFn =
//     <O: {}, K: $Keys<O>, V: $ElementType<O, K>, FN: (v: V, k: K) => ?false>(obj: O, fn: FN) => void;

//   declare type ForEachArrayFn =
//     <V, A: Array<V>, FN: (v: V, i: number) => ?false>(array: A, fn: FN) => void;

//   declare module.exports: ForEachObjectFn & ForEachArrayFn
// }