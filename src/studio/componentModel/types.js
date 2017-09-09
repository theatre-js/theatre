// @flow
import {type ComponentType as ReactComponentType} from 'react'

// @todo maybe this should be an opaque type given that not any string is a valid ComponentID
export type ComponentID = string

export type ComponentInstantiationDescriptor = {
  componentID: ComponentID,
  props: {[key: string]: $FixMe},
  modifierInstantiationDescriptorsByKey: {[key: string]: ModifierInstantiationDescriptor},
  modifierInstantiationDescriptorKeysInOrder: Array<string>,
}

type ModifierInstantiationDescriptor = {
  modifierID: string,
  props: {[key: string]: $FixMe},
}

export type DeclarativeComponentDescriptor = {
  id: ComponentID,
  type: 'Declarative',
  valuesByLocalValueUniqueID: {[localUniqueID: string]: ValueDescriptor},
  childrenInTree: ?ReferenceToLocalValue,
  // propTypes: {[propKey: string]: PropType},
}

// export type PropType = {}

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

export type ComponentModelNamespaceState = {
  componentDescriptorsById: {[id: ComponentID]: ComponentDescriptor},
}