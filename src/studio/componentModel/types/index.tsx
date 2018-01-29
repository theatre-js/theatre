import {ComponentType as ReactComponentType} from 'react'
import {
  IDeclarativeComponentDescriptor,
  IModifierDescriptor,
} from './declarative'
export * from './declarative'

export type ComponentId = string

export interface IComponentInstantiationDescriptor {
  displayName: string
  componentId: ComponentId
  props: {[key: string]: $FixMe}
  modifierInstantiationDescriptorsById: {[id: string]: $FixMe}
  listOfModifierInstantiationDescriptorIds: Array<string>
}

export interface IHardCodedComponentDescriptor {
  displayName: string
  id: ComponentId
  type: 'HardCoded'
  reactComponent: ReactComponentType<$FixMe>
}

export type ComponentDescriptor =
  | IDeclarativeComponentDescriptor
  | IHardCodedComponentDescriptor

export interface IComponentModelNamespaceState {
  componentDescriptors: {
    core: {[id: string]: ComponentDescriptor}
    custom: {[id: string]: ComponentDescriptor}
  }
  modifierDescriptors: {
    core: {[id: string]: IModifierDescriptor}
  }
}
