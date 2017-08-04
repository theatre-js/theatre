// @flow
import type {CommonNamespaceState} from '$lb/common/types'
import type {ProjectsNamespaceState} from '$lb/projects/types'

export type StoreState = {
  common: CommonNamespaceState,
  projects: ProjectsNamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType