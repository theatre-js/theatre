// @flow
import Tappable from '$shared/DataVerse/utils/Tappable'

export type MapKey = string | number

export type AddressedChangeset = {address: Array<MapKey>}

export type Address = {root: IReactive, path: Array<MapKey>}

export interface IReactive {

}

export interface IReactiveBox<V> extends IReactive {
  getValue(): V,
  changes: () => Tappable<V>,
}

export type MapAtomChangeType<O: {}> = {overriddenRefs: $Shape<O>, deletedKeys: Array<$Keys<O>>, addedKeys: Array<$Keys<O>>}

export interface IReactiveMap<O> extends IReactive {

}

export interface IReactiveArray<T> extends IReactive {

}

