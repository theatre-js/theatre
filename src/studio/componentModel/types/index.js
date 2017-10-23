// @flow
import {type ComponentType as ReactComponentType} from 'react'
import type {DeclarativeComponentDescriptor} from './declarative'
/*:: export type * from './declarative' */
import * as D from '$shared/DataVerse'

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

export type ComponentModelNamespaceState = D.ObjectLiteral<{|
  componentDescriptorsById: D.ObjectLiteral<{[id: ComponentId]: ComponentDescriptor}>,
|}>