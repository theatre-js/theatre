
import {CommonNamespaceState} from '$lb/common/types'
import {ProjectsNamespaceState} from '$lb/projects/types'

export type LBStoreState = {
  common: CommonNamespaceState
  projects: ProjectsNamespaceState
}

export type Selector<ReturnType, ParamsType> = (
  state: LBStoreState,
  params: ParamsType,
) => ReturnType
