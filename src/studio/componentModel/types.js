// @flow
import {type ComponentType as ReactComponentType} from 'react'
import * as D from '$shared/DataVerse'

// @todo maybe this should be an opaque type given that not any string is a valid ComponentID
export type ComponentID = string

export type ComponentInstantiationDescriptor = D.MapOfReferences<{
  componentID: D.Reference<ComponentID>,
  props?: D.MapOfReferences<{[key: string]: $FixMe}>,
}>

export type UserDefinedComponentDescriptor = {|
  componentID: ComponentID,
  componentType: 'UserDefined',
  valuesByLocalValueUniqueID?: {[localUniqueID: string]: ValueDescriptor},
  childrenInTree?: ReferenceToLocalValue,
  props?: {[propKey: string]: PropDefinition},
|}

export type AliasComponentDescriptor = {|
  componentID: ComponentID,
  componentType: 'Alias',
  aliasedComponentID: ComponentID,
|}

export type PrimitiveComponentDescriptor = {|
  componentID: ComponentID,
  componentType: 'Primitive',
  reactComponent: ReactComponentType<$FixMe>,
|}

export type ComponentDescriptor =
  UserDefinedComponentDescriptor | AliasComponentDescriptor | PrimitiveComponentDescriptor

export type PropDefinition = {}

export type ReferenceToLocalValue = {
  type: 'ReferenceToLocalValue',
  localValueUniqueID: string,
}

export type ValueDescriptor =
  | ComponentInstantiationDecriptor
  | URLStringDescriptor

export type URLStringDescriptor = {
  type: 'TheaterJS/URLString',
  url: string,
}

export type ComponentInstantiationDecriptor = {
  type: 'ComponentInstantiationDecriptor',
  componentID: ComponentID,
  props?: {[propKey: string]: ValueDescriptor},
}
// const SomeImage: ComponentDescriptor = {
//   type: 'TheaterJSCustomComponent',
//   id: 'sldkj2o3u',
//   valuesByLocalValueUniqueID: {
//     sld1: {
//       type: 'ComponentInstantiationDecriptor',
//       componentID: 'TheaterJSDOM/Image',
//       props: {
//         source: {
//           type: 'TheaterJS/URLString',
//           url: '/someImage.png',
//         },
//       },
//     },
//   },
//   childrenInTree: {
//     type: 'ReferenceToLocalValue',
//     localValueUniqueID: 'sld1',
//   },
// }