// @flow

import type {If, True, False} from './types'

export type ArrayLiteral<V> = Array<V> & {'**isArrayLiteral**': True, '**isObjectLiteral**': False, '**isPrimitiveLiteral**': False, _v: V}
export type IsArrayLiteral<V> = $ElementType<V, '**isArrayLiteral**'>
export type ValueOfArrayLiteral<V> = If<IsObjectLiteral<V>, $ElementType<V, '_v'>, void>
export const array = <V, A: Array<V>>(a: A): ArrayLiteral<V> => (a: $IntentionalAny)

export type ObjectLiteral<O: {}> = O & {'**isArrayLiteral**': False, '**isObjectLiteral**': True, '**isPrimitiveLiteral**': False, _o: O}
export type IsObjectLiteral<V> = $ElementType<V, '**isObjectLiteral**'>
export type ValueOfObjectLiteral<V> = If<IsObjectLiteral<V>, $ElementType<V, '_o'>, void>
export const object = <O: {}>(o: O): ObjectLiteral<O> => (o: $IntentionalAny)

export type PrimitiveLiteral<V> = V & {'**isArrayLiteral**': False, '**isObjectLiteral**': False, '**isPrimitiveLiteral**': True, _v: V}
export type ValueOfPrimitiveLiteral<V> = If<IsPrimitiveLiteral<V>, $ElementType<V, '_v'>, void>
export type IsPrimitiveLiteral<V, Then, Else> = If<$ElementType<V, '**isPrimitiveLiteral**'>, Then, Else>
export const primitive = <V>(v: V): PrimitiveLiteral<V> => (v: $IntentionalAny)