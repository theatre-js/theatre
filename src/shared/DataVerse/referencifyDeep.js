// @flow
import isPlainObject from 'lodash/isPlainObject'
import Reference from './Reference'
import MapOfReferences from './MapOfReferences'
import mapValues from 'lodash/mapValues'

type Mapper =
  (<V: {+constructor: mixed}>(v: V) => Reference<V>) &
  (<V: {}>(v: V) => MapOfReferences<$ObjMap<V, Mapper>>) &
  (<V>(v: V) => Reference<V>)

type ReferencifyDeepDeep = Mapper

export type ReferencifyDeepObject<V: {}> = MapOfReferences<$ObjMap<V, Mapper>>

export const referencifyDeep: ReferencifyDeepDeep = (jsValue: mixed) => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject((jsValue: $IntentionalAny))
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