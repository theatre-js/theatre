import {CommonNamespaceState} from '$lb/common/types'
import {ProjectsNamespaceState} from '$lb/projects/types'
import {StudioStatePersistorNamespaceState} from '$lb/studioStatePersistor/types'

export type LBStoreState = {
  common: CommonNamespaceState
  projects: ProjectsNamespaceState
  studioStatePersistor: StudioStatePersistorNamespaceState
}

export type Selector<ReturnType, ParamsType> = (
  state: LBStoreState,
  params: ParamsType,
) => ReturnType
