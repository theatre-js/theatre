// @flow

export type AddressedChangeset = {address: Array<string | number>}

export type Address = {root: IReactive, path: Array<string | number>}

export interface IReactive {

}

export interface IReactiveBox<T> extends IReactive {

}

export type MapAtomChangeType<O: {}> = {overriddenRefs: $Shape<O>, deletedKeys: Array<$Keys<O>>}

export interface IReactiveMap<O> extends IReactive {

}

export interface IReactiveArray<T> extends IReactive {

}

