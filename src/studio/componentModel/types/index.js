// @flow
import {type ComponentType as ReactComponentType} from 'react'
import type {DeclarativeComponentDescriptor} from './declarative'
/*:: export type * from './declarative' */

// @todo maybe this should be an opaque type given that not any string is a valid ComponentID
export type ComponentID = string

export type ComponentInstantiationDescriptor = {|
  componentID: ComponentID,
  props: {[key: string]: $FixMe},
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

export type ComponentModelNamespaceState = {|
  componentDescriptorsById: {[id: ComponentID]: ComponentDescriptor},
|}