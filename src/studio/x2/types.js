// @flow
import type {PathToLocalHiddenValueDescriptor, ComponentInstantiationValueDescriptor} from '$studio/componentModel/types'

export type PathToInspectable = PathToLocalHiddenValueDescriptor
export type Inspectable = ComponentInstantiationValueDescriptor // later, we'll also be able to inspect a style selector's rules

export type X2NamespaceState = {
  pathToInspectable: ?PathToInspectable,
}