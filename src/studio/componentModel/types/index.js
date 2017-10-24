// @flow
import {type ComponentType as ReactComponentType} from 'react'
import type {DeclarativeComponentDescriptor, ModifierDescriptor} from './declarative'
/*:: export type * from './declarative' */

// @todo maybe this should be an opaque type given that not any string is a valid ComponentId
export type ComponentId = string

export type ComponentInstantiationDescriptor = {|
  componentId: ComponentId,
  props: {[key: string]: $FixMe},
  modifierInstantiationDescriptorsById: {[id: string]: $FixMe},
  listOfModifierInstantiationDescriptorIds: Array<string>,
|}

export type AliasComponentDescriptor = {|
  id: ComponentId,
  type: 'Alias',
  aliasedComponentId: ComponentId,
|}

export type HardCodedComponentDescriptor = {|
  id: ComponentId,
  type: 'HardCoded',
  reactComponent: ReactComponentType<$FixMe>,
|}

export type ComponentDescriptor =
  DeclarativeComponentDescriptor | AliasComponentDescriptor | HardCodedComponentDescriptor

// export type ComponentModelNamespaceState = {|
//   componentDescriptorsById: {[id: ComponentId]: ComponentDescriptor},
// |}

export type ComponentModelNamespaceState = {|
  componentDescriptors: {|
    core: {[id: ComponentId]: ComponentDescriptor},
    custom: {[id: ComponentId]: ComponentDescriptor},
  |},
  modifierDescriptors: {|
    core: {[id: string]: ModifierDescriptor},
  |},
|}