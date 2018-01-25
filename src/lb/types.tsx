// @flow
import {CommonNamespaceState} from '$lb/common/types'
import {ProjectsNamespaceState} from '$lb/projects/types'

export type StoreState = {
  common: CommonNamespaceState,
  projects: ProjectsNamespaceState,
}

export type Selector<ReturnType, ParamsType> = (
  state: StoreState,
  params: ParamsType,
) => ReturnType
