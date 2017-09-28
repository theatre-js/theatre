// @flow
import type {ComponentID, ComponentInstantiationDescriptor} from './index'

export type DeclarativeComponentDescriptor = {
  id: ComponentID,
  type: 'Declarative',
  childrenInTree: ?ReferenceToLocalValue,
  // propTypes: {[propKey: string]: PropType},
  tree: {
    ownedComponentInstantiationDescriptors: {[instantiationId: string]: ComponentInstantiationDescriptor},
    whatToRender: WhatToRender,
  },
}

export type WhatToRender =
  | {type: 'AnOwnedComponentInstantiator', which: string}
  | ValueDescriptor

export type ReferenceToLocalValue = {
  type: 'ReferenceToLocalValue',
  localValueUniqueID: string,
}

export type ValueDescriptor =
  | ComponentInstantiationDescriptor