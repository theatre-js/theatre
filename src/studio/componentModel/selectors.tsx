import {Selector} from '$studio/types'
import {ComponentId, ComponentDescriptor} from './types'
import stringStartsWith from 'lodash/startsWith'
import {get} from 'lodash'

export const getComponentDescriptor: Selector<
  ComponentDescriptor,
  ComponentId
> = (state, id: ComponentId) => {
  return get(state, getPathToComponentDescriptor(id))
}

export const getPathToComponentDescriptor = (id: ComponentId) => {
  const isCore = isCoreComponent(id)

  if (isCore) {
    return ['ahistoricComponentModel', 'coreComponentDescriptors', id]
  } else {
    return ['historicComponentModel', 'customComponentDescriptors', id]
  }
}

export function isCoreComponent(id: string) {
  return stringStartsWith(id, 'TheaterJS/Core/');
}