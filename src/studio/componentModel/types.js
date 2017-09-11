// @flow
import {type ComponentType as ReactComponentType} from 'react'

// @todo maybe this should be an opaque type given that not any string is a valid ComponentID
export type ComponentID = string

export type ComponentInstantiationDescriptor = {
  componentID: ComponentID,
  props: {[key: string]: $FixMe},
  modifiersByKey: {[key: string]: ModifierInstantiationDescriptor},
  listOfModifiers: Array<string>,
}

type ModifierInstantiationDescriptor = {
  modifierID: string,
  props: {[key: string]: $FixMe},
}

export type ModifierDescriptor = {
  modifierID: string,
}

export type DeclarativeComponentDescriptor = {
  id: ComponentID,
  type: 'Declarative',
  ownedComponentInstantiationDescriptors: {[instantiationId: string]: ComponentInstantiationDescriptor},
  childrenInTree: ?ReferenceToLocalValue,
  // propTypes: {[propKey: string]: PropType},
}

// export type PropType = {}

export type AliasComponentDescriptor = {|
  id: ComponentID,
  type: 'Alias',
  aliasedComponentID: ComponentID,
|}

export type HardCodedComponentDescriptor = {
  id: ComponentID,
  type: 'HardCoded',
  reactComponent: ReactComponentType<$FixMe>,
}

export type ComponentDescriptor =
  DeclarativeComponentDescriptor | AliasComponentDescriptor | HardCodedComponentDescriptor


export type ReferenceToLocalValue = {
  type: 'ReferenceToLocalValue',
  localValueUniqueID: string,
}

export type ValueDescriptor =
  | ComponentInstantiationDescriptor
  | URLStringDescriptor

export type URLStringDescriptor = {
  type: 'TheaterJS/URLString',
  url: string,
}

export type ComponentModelNamespaceState = {
  componentDescriptorsById: {[id: ComponentID]: ComponentDescriptor},
}