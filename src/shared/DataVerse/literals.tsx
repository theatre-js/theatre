

import {True, False} from './types'

// export type ArrayLiteral<V> = Array<V> & {
//   '**isArrayLiteral**': True,
//   '**isObjectLiteral**': False,
//   '**isPrimitiveLiteral**': False,
//   ___arrayElementType: V,
// }
// export type IsArrayLiteral<A> = A['**isArrayLiteral**']
// export type ValueOfArrayLiteral<A> = A['___arrayElementType']
// export const array = <V, A extends Array<V>>(a: A): ArrayLiteral<V> =>
//   (a as $IntentionalAny)

// export type ObjectLiteral<O> = O & {
//   '**isArrayLiteral**': False,
//   '**isObjectLiteral**': True,
//   '**isPrimitiveLiteral**': False,
//   ___objectType: O,
// }
// export type IsObjectLiteral<V> = V['**isObjectLiteral**']
// export type ValueOfObjectLiteral<V> = V['___objectType']
// export const object = <O>(o: O): ObjectLiteral<O> => (o as $IntentionalAny)

// export type PrimitiveLiteral<V> = V & {
//   '**isArrayLiteral**': False,
//   '**isObjectLiteral**': False,
//   '**isPrimitiveLiteral**': True,
//   ___literalType: V,
// }
// export type IsPrimitiveLiteral<V> = V['**isPrimitiveLiteral**']
// export type ValueOfPrimitiveLiteral<V> = V['___literalType']
// export const primitive = <V>(v: V): PrimitiveLiteral<V> => (v as $IntentionalAny)
