import {ComponentType as ReactComponentType} from 'react'
import {
  IDeclarativeComponentDescriptor,
  IModifierDescriptor,
} from './declarative'
export * from './declarative'

export type ComponentId = string

export interface IHardCodedComponentDescriptor {
  displayName: string
  id: ComponentId
  type: 'HardCoded'
  reactComponent: ReactComponentType<$FixMe>
}

export type ComponentDescriptor =
  | IDeclarativeComponentDescriptor
  | IHardCodedComponentDescriptor

export interface IComponentModelNamespaceHistoricState {
  customComponentDescriptors: {[id: string]: ComponentDescriptor}
}

export interface IComponentModelNamespaceAhistoricState {
  coreComponentDescriptors: {[id: string]: ComponentDescriptor}
  coreModifierDescriptors: {[id: string]: IModifierDescriptor}
  collapsedElementsByVolatileId: Record<string, true>
}
