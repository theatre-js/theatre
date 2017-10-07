// @flow
import {type ComponentType as ReactComponentType} from 'react'
import type {DeclarativeComponentDescriptor} from './declarative'
/*:: export type * from './declarative' */
import * as D from '$shared/DataVerse'

// @todo maybe this should be an opaque type given that not any string is a valid ComponentID
export type ComponentID = string

export type ComponentInstantiationDescriptor = {|
  componentID: ComponentID,
  props: {[key: string]: $FixMe},
  modifierInstantiationDescriptorsByID: {[id: string]: $FixMe},
  listOfModifierInstantiationDescriptorIDs: Array<string>,
|}

export type AliasComponentDescriptor = {|
  id: ComponentID,
  type: 'Alias',
  aliasedComponentID: ComponentID,
|}

export type HardCodedComponentDescriptor = {|
  id: ComponentID,
  type: 'HardCoded',
  reactComponent: ReactComponentType<$FixMe>,
|}

export type ComponentDescriptor =
  DeclarativeComponentDescriptor | AliasComponentDescriptor | HardCodedComponentDescriptor

// export type ComponentModelNamespaceState = {|
//   componentDescriptorsById: {[id: ComponentID]: ComponentDescriptor},
// |}

export type ComponentModelNamespaceState = D.ObjectLiteral<{|
  componentDescriptorsById: D.ObjectLiteral<{[id: ComponentID]: ComponentDescriptor}>,
|}>