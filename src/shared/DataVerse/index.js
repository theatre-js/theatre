// @flow
import Reference from './Reference'
import MapOfReferences from './MapOfReferences'
import ArrayOfReferences from './ArrayOfReferences'
import referencifyDeep from './referencifyDeep'
import AbstractReference from './utils/AbstractReference'

function takeAbs(a: AbstractReference) {
  return a
}

takeAbs(new MapOfReferences({a: new Reference('hi')}))

export {
  Reference,
  MapOfReferences,
  referencifyDeep,
  ArrayOfReferences,
}