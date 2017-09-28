// @flow
import isPlainObject from 'lodash/isPlainObject'
import {type IBoxAtom, default as BoxAtom} from './BoxAtom'
import {type IMapAtom, default as MapAtom} from './MapAtom'
import {type IArrayAtom, default as ArrayAtom} from './ArrayAtom'
import mapValues from 'lodash/mapValues'
import {type IAtom, default as Atom} from './utils/Atom'

type InstanceOfAnyClass = {+constructor: Function}

type AtomifyDeepFn =
  (<V: IAtom>(v: V) => V) &
  // (<V, A: Array<V>>(a: A) => IArrayAtom<AtomifyDeepType<V>>) &
  (<V, A: Array<V>>(a: A) => IArrayAtom<$Call<AtomifyDeepFn, V>>) &
  (<V: InstanceOfAnyClass>(v: V) => IBoxAtom<V>) &
  (<V: {}>(v: V) => IMapAtom<$ObjMap<V, AtomifyDeepFn>>) &
  (<V>(v: V) => IBoxAtom<V>)


// type AtomifyDeepArray<V, A: Array<V>> = IArrayAtom<AtomifyDeepType<V>>
// type AtomifyDeepAtom<V: IAtom> = V
// type AtomifyDeepConstructedObject<V: {+constructor: $IntentionalAny}> = IBoxAtom<V>
// type AtomifyDeepObject<V: {}> = IMapAtom<$ObjMap<V, AtomifyDeepFn>>
// type AtomifyDeepPrimitive<V> = IBoxAtom<V>
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
  return new BoxAtom(jsPrimitive)
}

export default atomifyDeep

// export type AtomifyDeepType<V> = $Call<typeof atomifyDeep, V>