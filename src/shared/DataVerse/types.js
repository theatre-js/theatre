// @flow

// export type DeepDiff = {
//   oldValue: mixed,
//   newValue: mixed,
//   address: Array<string | number>,
// }

// export type AtomChangeset = AddressedChangeset &

export type AddressedChangeset = {address: Array<string | number>}
// export type AnyChangeset = AtomChangeset

export interface Pointer<V> {

}


export interface IAbstractWire {

}

export interface ICompositeWire extends IAbstractWire {

}

export interface IMapWire<O: {}> extends ICompositeWire {
  get<K: $Keys<O>, V: $ElementType<O, K>>(key: K): V,
  pointer(): $FixMe,
}

export interface IArrayWire<T> extends ICompositeWire {
  get<I: number>(index: I): ?T,
  pointer(): $FixMe,
}


export interface IWire<T> extends IAbstractWire {
  get(): T,
}