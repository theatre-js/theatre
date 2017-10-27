// @flow
import type {Selector} from '$studio/types'
import type {ComponentId, PathToLocalHiddenValueDescriptor} from './types'
import stringStartsWith from 'lodash/startsWith'

export const getComponentDescriptor: Selector<*, *> = (state, id: ComponentId) =>
  state.componentModel.componentDescriptors[stringStartsWith(id, 'TheaterJS/Core/') ? 'core' : 'custom'][id]

export const getLocalHiddenValueDescriptorByPath: Selector<*, *> = (state, path: PathToLocalHiddenValueDescriptor) => {
  const componentDescriptor = getComponentDescriptor(state, path.componentId)
  if (componentDescriptor.type === 'Declarative') {
    return componentDescriptor.localHiddenValuesById[path.localHiddenValueId]
  } else {
    return undefined
  }
}