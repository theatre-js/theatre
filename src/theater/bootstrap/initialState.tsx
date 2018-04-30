import {default as common} from '$theater/common/initialState'
import {historicWorkspaceInitialState as historicWorkspace, ahistoricWorkspaceInitialState as ahistoricWorkspace} from '$theater/workspace/initialState'
import {
  historicInitialState as historicComponentModel,
  ahistoricInitialState as ahistoricComponentModel,
} from '$theater/componentModel/initialState'
import {IStoreHistoricState, IStoreAhistoricSTate} from '../types'

export const initialPersistedState: IStoreHistoricState = {
  common,
  historicWorkspace,
  historicComponentModel,
}

export const initialAhistoricState: IStoreAhistoricSTate = {
  stateIsHydrated: false,
  pathToProject: undefined,
  ahistoricComponentModel,
  ahistoricWorkspace,
}
