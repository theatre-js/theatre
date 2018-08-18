import {AllPossiblePropTypes} from '$tl/objects/propTypes'
import InternalObject from '$tl/objects/InternalObject'

export type PropsOfProp = {
  propKey: string
  type: AllPossiblePropTypes
  internalObject: InternalObject
}
