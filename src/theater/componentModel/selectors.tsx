import {Selector} from '$theater/types'
import {IComponentId, IComponentDescriptor} from './types'
import stringStartsWith from 'lodash/startsWith'
import {get} from 'lodash'

export const getComponentDescriptor: Selector<
  IComponentDescriptor,
  IComponentId
> = (state, id: IComponentId) => {
  return get(state, getPathToComponentDescriptor(id))
}

export const getPathToComponentDescriptor = (id: IComponentId) => {
  const isCore = isCoreComponent(id)

  if (isCore) {
    return ['ahistoricComponentModel', 'coreComponentDescriptors', id]
  } else {
    return ['historicComponentModel', 'customComponentDescriptors', id]
  }
}

export function isCoreComponent(id: string) {
  return stringStartsWith(id, 'TheaterJS/Core/')
}
