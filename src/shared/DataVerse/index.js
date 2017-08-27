// @flow
import fromJS from './Atom/fromJS'
import {type HigherOrderComponent} from 'react-flow-types'

const DataVerse = {
  fromJS,
}

export type Subscription = {
  isSubscription: true,
  active: boolean,
  unsubscribe(): void,
}

export type Subscribable<T> = {
  map<X>(fn: (a: T) => X): Subscribable<X>,
  getValue(): T,
  subscribe(fn: (v: T) => mixed): Subscription,
}

export type Atom<T = void> = $FlowFixMe


// interface DerivableArray<T> {
//   map<X>(f: (v: T) => X): DerivableArray<X>
// }

// class ArrayAtom implements DerivableArray<*> {
//   map(f): any {

//   }
// }

// type StringOnly<T: string> = boolean
// type NumberOnly<T: number> = null

// type Convertor<B> = StringOnly<B> & NumberOnly<B>

// declare var a: Convertor<number>

// (a: null)

// export type BaseAtom = {
//   changeEvents(): Subscribable<void>,
// }

// export type ObjectAtom<O: {}> = BaseAtom & {
//   get<K: $Keys<O>>(key: K): $ElementType<O, K>,
//   set<K: $Keys<O>, V: $ElementType<O, K>>(key: K): ObjectAtom<O>,
//   getLength(): number,
// }

// export type ArrayAtom<T> = BaseAtom & {
//   get<I: number>(index: I): T,
//   set<I: number>(index: I, value: T): ArrayAtom<T>,
//   getLength(): number,
// }

// export type PrimitiveAtom<T> = BaseAtom & {
//   getValue(): T,
//   setValue(t: T): PrimitiveAtom<T>,
// }

// type FromArray<T: Array<any>> = ArrayAtom<Choose<T>>

// type FromMixed<T> = PrimitiveAtom<T>

// type Choose<T> =
//   FromObject<T> & FromArray<T> & FromMixed<T>

// type Elemental =
//   & <O: {}>(o: O) => FromObject<O>
//   & <T, A: Array<T>>(a: A) => ArrayAtom<Choose<T>>
//   & <T>(t: T) => PrimitiveAtom<T>

// export type FromObject<T: {}> = ObjectAtom<$ObjMap<T, Elemental>>

// declare var c: FromObject<{s: string, n: number, o: {foo: string, bar: Array<{baz: string}>}}>

// c.get('s')

type Identity = <T>(t: T) => T

export const withSubscribables = <S: {[key: mixed]: Subscribable<any>}>(fn: (props: $FlowFixMe) => S): HigherOrderComponent<{}, $ObjMap<S, Identity>> => {
  return (null: any)
}

export default DataVerse