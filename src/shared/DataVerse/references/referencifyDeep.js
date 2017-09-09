// @flow
import isPlainObject from 'lodash/isPlainObject'
import {type IReference, default as $Reference} from './Reference'
import {type IMapOfReferences, default as MapOfReferences} from './MapOfReferences'
import mapValues from 'lodash/mapValues'
import {type IArrayOfReferences, default as ArrayOfReferences} from './ArrayOfReferences'
import {type IAbstractReference, default as AbstractReference} from './utils/AbstractReference'

type InstanceOfAnyClass = {+constructor: Function}

type ReferencifyDeepFn =
  (<V: IAbstractReference>(v: V) => V) &
  // (<V, A: Array<V>>(a: A) => IArrayOfReferences<ReferencifyDeepType<V>>) &
  (<V, A: Array<V>>(a: A) => IArrayOfReferences<$Call<ReferencifyDeepFn, V>>) &
  (<V: InstanceOfAnyClass>(v: V) => IReference<V>) &
  (<V: {}>(v: V) => IMapOfReferences<$ObjMap<V, ReferencifyDeepFn>>) &
  (<V>(v: V) => IReference<V>)

// export type ReferencifyDeepType<V> = $Call<ReferencifyDeepFn, V>

// type ReferencifyDeepArray<V, A: Array<V>> = IArrayOfReferences<ReferencifyDeepType<V>>
// type ReferencifyDeepAbstractReference<V: IAbstractReference> = V
// type ReferencifyDeepConstructedObject<V: {+constructor: $IntentionalAny}> = IReference<V>
// type ReferencifyDeepObject<V: {}> = IMapOfReferences<$ObjMap<V, ReferencifyDeepFn>>
// type ReferencifyDeepPrimitive<V> = IReference<V>
// export type ReferencifyDeepType<V> = ReferencifyDeepArray<*, V> | ReferencifyDeepAbstractReference<V> | ReferencifyDeepConstructedObject<V> | ReferencifyDeepObject<V> | ReferencifyDeepPrimitive<V>

export const referencifyDeep: ReferencifyDeepFn = (jsValue: mixed) => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject((jsValue: $IntentionalAny))
  } else if (jsValue instanceof AbstractReference) {
    return jsValue
  } else {
    return fromJSPrimitive(jsValue)
  }
}

export const fromJSArray = (jsArray: $FixMe): $FixMe => {
  return new ArrayOfReferences(jsArray.map(referencifyDeep))
}

export const fromJSObject = (jsObject: {[key: mixed]: mixed}): $FixMe => {
  return new MapOfReferences(mapValues(jsObject, referencifyDeep))
}

export const fromJSPrimitive = (jsPrimitive: mixed): $FixMe => {
  return new $Reference(jsPrimitive)
}

export default referencifyDeep