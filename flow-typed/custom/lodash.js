// @flow

declare module 'lodash' {
  declare module.exports: {
    noop: () => void,
    identity: <T>(T) => T,
    difference: <V>(Array<V>, Array<V>) => Array<V>,
    uniq: <V>(Array<V>) => Array<V>,
    mapValues: <K, V, T, O: {[k: K]: V}, Fn: (V, K) => T>(O, Fn) => {[k: K]: T},
    keyBy: $FixMe,
    without: <V>(Array<V>, V) => Array<V>,
    endsWith: (string, string) => boolean,
    unset: <O: {}>(O, Array<string | number>) => O,
    set: $FixMe,
    clamp: (number, number, ?number) => number,
    get: $FixMe, //({}, Array<string | number> | Object | string | number) => $FixMe,
    map:
      (<V, A: Array<V>, T, Fn: (V, number) => T>(A, Fn) => Array<T>) &
      (<K, V, O: {[k: K]: V}, T, Fn: (V, K) => T>(O, Fn) => Array<T>),
  }
}

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

declare module 'lodash/without' {
  declare module.exports:  <V, A: Array<V>>(a: A, V) => Array<V>
}

declare module 'lodash/forEach' {
  declare module.exports:
    (<O: {}, K: $Keys<O>, V: $ElementType<O, K>, FN: (v: V, k: K) => ?false>(obj: O, fn: FN) => void) &
    (<V, A: Array<V>, FN: (v: V, i: number) => ?false>(array: A, fn: FN) => void)
}

declare module 'lodash/mapValues' {
  declare type Fn<T> = () => T

  declare module.exports:
    <O: {}, K: $Keys<O>, V: $ElementType<O, K>, T>(o: O, mapper: (value: V, k: K) => T) => $ObjMap<O, Fn<T>>
}