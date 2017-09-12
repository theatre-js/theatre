// @flow
import isPlainObject from 'lodash/isPlainObject'
import {type IAtom, default as $Atom} from './Atom'
import {type IMapAtom, default as MapAtom} from './MapAtom'
import mapValues from 'lodash/mapValues'
import {type IArrayAtom, default as ArrayAtom} from './ArrayAtom'
import {type IAtom, default as Atom} from './utils/Atom'

type InstanceOfAnyClass = {+constructor: Function}

type AtomifyDeepFn =
  (<V: IAtom>(v: V) => V) &
  // (<V, A: Array<V>>(a: A) => IArrayAtom<AtomifyDeepType<V>>) &
  (<V, A: Array<V>>(a: A) => IArrayAtom<$Call<AtomifyDeepFn, V>>) &
  (<V: InstanceOfAnyClass>(v: V) => IAtom<V>) &
  (<V: {}>(v: V) => IMapAtom<$ObjMap<V, AtomifyDeepFn>>) &
  (<V>(v: V) => IAtom<V>)

// export type AtomifyDeepType<V> = $Call<AtomifyDeepFn, V>

// type AtomifyDeepArray<V, A: Array<V>> = IArrayAtom<AtomifyDeepType<V>>
// type AtomifyDeepAtom<V: IAtom> = V
// type AtomifyDeepConstructedObject<V: {+constructor: $IntentionalAny}> = IAtom<V>
// type AtomifyDeepObject<V: {}> = IMapAtom<$ObjMap<V, AtomifyDeepFn>>
// type AtomifyDeepPrimitive<V> = IAtom<V>
// export type AtomifyDeepType<V> = AtomifyDeepArray<*, V> | AtomifyDeepAtom<V> | AtomifyDeepConstructedObject<V> | AtomifyDeepObject<V> | AtomifyDeepPrimitive<V>

export const atomifyDeep: AtomifyDeepFn = (jsValue: mixed) => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject((jsValue: $IntentionalAny))
  } else if (jsValue instanceof Atom) {
    return jsValue
  } else {
    return fromJSPrimitive(jsValue)
  }
}

export const fromJSArray = (jsArray: $FixMe): $FixMe => {
  return new ArrayAtom(jsArray.map(atomifyDeep))
}

export const fromJSObject = (jsObject: {[key: number | string]: mixed}): $FixMe => {
  return new MapAtom(mapValues(jsObject, atomifyDeep))
}

export const fromJSPrimitive = (jsPrimitive: mixed): $FixMe => {
  return new $Atom(jsPrimitive)
}

export default atomifyDeep