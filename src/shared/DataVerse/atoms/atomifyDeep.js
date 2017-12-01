// @flow
import isPlainObject from 'lodash/isPlainObject'
import {type IBoxAtom, default as box} from './box'
import {type IDictAtom, default as dict} from './dict'
import {type IArrayAtom, default as array} from './array'
import mapValues from 'lodash/mapValues'
import {default as AbstractAtom} from './utils/AbstractAtom'
import type {If} from '../types'
import type {
  IsArrayLiteral,
  IsObjectLiteral,
  ValueOfObjectLiteral,
  IsPrimitiveLiteral,
  ValueOfPrimitiveLiteral,
  ValueOfArrayLiteral,
} from '../literals'

// type InstanceOfAnyClass = {+constructor: Function}

// type AtomifyDeepFn =
//   (<V: IAtom>(v: V) => V) &
//   // (<V, A: Array<V>>(a: A) => IArrayAtom<AtomifyDeepType<V>>) &
//   (<V, A: Array<V>>(a: A) => IArrayAtom<$Call<AtomifyDeepFn, V>>) &
//   (<V: InstanceOfAnyClass>(v: V) => IBoxAtom<V>) &
//   (<V: {}>(v: V) => IDictAtom<$ObjMap<V, AtomifyDeepFn>>) &
//   (<V>(v: V) => IBoxAtom<V>)

type AtomifyDeepFn = <V>(V) => AtomifyDeepType<V>

export type AtomifyDeepType<V> = If<
  IsObjectLiteral<V>,
  AtomifyDeepObject<ValueOfObjectLiteral<V>>,
  If<
    IsArrayLiteral<V>,
    IArrayAtom<AtomifyDeepType<ValueOfArrayLiteral<V>>>,
    If<IsPrimitiveLiteral<V>, IBoxAtom<ValueOfPrimitiveLiteral<V>>, IBoxAtom<V>>,
  >,
>

type AtomifyDeepObject<O: {}> = IDictAtom<$ObjMap<O, AtomifyDeepFn>>

// type AtomifyDeepArray<V, A: Array<V>> = IArrayAtom<AtomifyDeepType<V>>
// type AtomifyDeepAtom<V: IAtom> = V
// type AtomifyDeepConstructedObject<V: {+constructor: $IntentionalAny}> = IBoxAtom<V>
// type AtomifyDeepObject<V: {}> = IDictAtom<$ObjMap<V, AtomifyDeepFn>>
// type AtomifyDeepPrimitive<V> = IBoxAtom<V>
// export type AtomifyDeepType<V> = AtomifyDeepArray<*, V> | AtomifyDeepAtom<V> | AtomifyDeepConstructedObject<V> | AtomifyDeepObject<V> | AtomifyDeepPrimitive<V>

export const atomifyDeep: $FixMe = (jsValue: mixed) => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject((jsValue: $IntentionalAny))
  } else if (jsValue instanceof AbstractAtom) {
    return jsValue
  } else {
    return fromJSPrimitive(jsValue)
  }
}

export const fromJSArray = (jsArray: $FixMe): $FixMe => {
  return array(jsArray.map(atomifyDeep))
}

export const fromJSObject = (jsObject: {[key: number | string]: mixed}): $FixMe => {
  return dict(mapValues(jsObject, atomifyDeep))
}

export const fromJSPrimitive = (jsPrimitive: mixed): $FixMe => {
  return box(jsPrimitive)
}

export default atomifyDeep

// export type AtomifyDeepType<V> = $Call<typeof atomifyDeep, V>
