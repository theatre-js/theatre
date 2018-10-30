import {default as common} from '$studio/common/initialState'
import {
  historicWorkspaceInitialState as historicWorkspace,
  ahistoricWorkspaceInitialState as ahistoricWorkspace,
} from '$studio/workspace/initialState'
import {
  historicInitialState as historicComponentModel,
  ahistoricInitialState as ahistoricComponentModel,
} from '$studio/componentModel/initialState'
import {IStoreHistoricState, IStoreAhistoricState} from '../types'

export const initialHistoricState: IStoreHistoricState = {
  common,
  historicWorkspace,
  historicComponentModel,
}

export const initialAhistoricState: IStoreAhistoricState = {
  stateIsHydrated: false,
  pathToProject: undefined,
  ahistoricComponentModel,
  ahistoricWorkspace,
}
