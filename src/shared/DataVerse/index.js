// @flow
import Reference from './Reference'
import MapOfReferences from './MapOfReferences'
import ArrayOfReferences from './ArrayOfReferences'
import {
  default as referencifyDeep,
  type ReferencifyDeepObject as _ReferencifyDeepObject,
} from './referencifyDeep'

export type ReferencifyDeepObject<V> = _ReferencifyDeepObject<V>

export {
  Reference,
  MapOfReferences,
  referencifyDeep,
  ArrayOfReferences,
}