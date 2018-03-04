
import {Selector} from '$studio/types'
import {ComponentId} from './types'
import stringStartsWith from 'lodash/startsWith'

export const getComponentDescriptor: Selector<*, *> = (
  state,
  id: ComponentId,
) =>
  state.componentModel.componentDescriptors[
    stringStartsWith(id, 'TheaterJS/Core/') ? 'core' : 'custom'
  ][id]

export const getPathToComponentDescriptor = (id: ComponentId) => [
  'componentModel',
  'componentDescriptors',
  stringStartsWith(id, 'TheaterJS/Core/') ? 'core' : 'custom',
  id,
]
