// @flow

import type {True, False} from './types'

export type ArrayLiteral<V> = Array<V> & {
  '**isArrayLiteral**': True,
  '**isObjectLiteral**': False,
  '**isPrimitiveLiteral**': False,
  ___arrayElementType: V,
}
export type IsArrayLiteral<A> = $ElementType<A, '**isArrayLiteral**'>
export type ValueOfArrayLiteral<A> = $ElementType<A, '___arrayElementType'>
export const array = <V, A: Array<V>>(a: A): ArrayLiteral<V> =>
  (a: $IntentionalAny)

export type ObjectLiteral<O: {}> = O & {
  '**isArrayLiteral**': False,
  '**isObjectLiteral**': True,
  '**isPrimitiveLiteral**': False,
  ___objectType: O,
}
export type IsObjectLiteral<V> = $ElementType<V, '**isObjectLiteral**'>
export type ValueOfObjectLiteral<V> = $ElementType<V, '___objectType'>
export const object = <O: {}>(o: O): ObjectLiteral<O> => (o: $IntentionalAny)

export type PrimitiveLiteral<V> = V & {
  '**isArrayLiteral**': False,
  '**isObjectLiteral**': False,
  '**isPrimitiveLiteral**': True,
  ___literalType: V,
}
export type IsPrimitiveLiteral<V> = $ElementType<V, '**isPrimitiveLiteral**'>
export type ValueOfPrimitiveLiteral<V> = $ElementType<V, '___literalType'>
export const primitive = <V>(v: V): PrimitiveLiteral<V> => (v: $IntentionalAny)
