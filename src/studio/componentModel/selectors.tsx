import {Selector} from '$studio/types'
import {IComponentId, IComponentDescriptor} from './types'
import {get, startsWith as stringStartsWith} from '$shared/utils'

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
  return stringStartsWith(id, 'TheatreJS/Core/')
}
