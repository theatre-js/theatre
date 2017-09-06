// @flow
import isPlainObject from 'lodash/isPlainObject'
import Reference from './Reference'
import MapOfReferences from './MapOfReferences'
import mapValues from 'lodash/mapValues'
import ArrayOfReferences from './ArrayOfReferences'
import AbstractReference from './utils/AbstractReference'

type Mapper =
  (<V, A: Array<V>>(v: A) => ArrayOfReferences<Array<ReferencifyDeepType<V>>>) &
  (<V: AbstractReference>(v: V) => V) &
  (<V: {+constructor: any}>(v: V) => Reference<V>) &
  (<V: {}>(v: V) => MapOfReferences<$ObjMap<V, Mapper>>) &
  (<V>(v: V) => Reference<V>)

type ReferencifyDeepDeep = Mapper

export type ReferencifyDeepObject<V: {}> = MapOfReferences<$ObjMap<V, Mapper>>
type ReferencifyDeepArray<V, A: Array<V>> = ArrayOfReferences<Array<ReferencifyDeepType<V>>>
type ReferencifyDeepPrimitive<V> = Reference<V>
type ReferencifyDeepType<V> = ReferencifyDeepObject<V> | ReferencifyDeepArray<V> | ReferencifyDeepPrimitive<*, V>

export const referencifyDeep: ReferencifyDeepDeep = (jsValue: mixed) => {
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

export const fromJSArray = (jsArray: Array<mixed>): $FixMe => {
  throw new Error(`Unimplemented`)
}

export const fromJSObject = (jsObject: {[key: mixed]: mixed}): $FixMe => {
  return new MapOfReferences(mapValues(jsObject, referencifyDeep))
}

export const fromJSPrimitive = (jsPrimitive: mixed): $FixMe => {
  return new Reference(jsPrimitive)
}

export default referencifyDeep