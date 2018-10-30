import {
  IModifierDescriptor,
  $IDeclarativeComponentDescriptor,
} from '$theater/componentModel/types/declarative'
import * as t from '$shared/ioTypes'
import {$IReactComponent} from '$shared/ioTypes/extras'
export * from '$theater/componentModel/types/declarative'

export const $IComponentId = t.string
export type IComponentId = t.StaticTypeOf<typeof $IComponentId>

export const $IHardCodedComponentDescriptor = t.type(
  {
    __descriptorType: t.literal('HardCoded'),
    displayName: t.string,
    id: $IComponentId,
    reactComponent: $IReactComponent,
  },
  'HardCodedComponentDescriptor',
)
export type IHardCodedComponentDescriptor = t.StaticTypeOf<
  typeof $IHardCodedComponentDescriptor
>

export const $IComponentDescriptor = t.taggedUnion(
  '__descriptorType',
  [$IDeclarativeComponentDescriptor, $IHardCodedComponentDescriptor],
  'ComponentDescriptor',
)
export type IComponentDescriptor = t.StaticTypeOf<typeof $IComponentDescriptor>

export const $IComponentModelNamespaceHistoricState = t.type(
  {
    customComponentDescriptors: t.record(t.string, $IComponentDescriptor),
  },
  'IComponentModelNamespaceHistoricState',
)
export type IComponentModelNamespaceHistoricState = t.StaticTypeOf<
  typeof $IComponentModelNamespaceHistoricState
>

export interface IComponentModelNamespaceAhistoricState {
  coreComponentDescriptors: {[id: string]: IComponentDescriptor}
  coreModifierDescriptors: {[id: string]: IModifierDescriptor}
  collapsedElementsByVolatileId: Record<string, true>
}
