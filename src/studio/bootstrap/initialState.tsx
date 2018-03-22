import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {
  historicInitialState as historicComponentModel,
  ahistoricInitialState as ahistoricComponentModel,
} from '$studio/componentModel/initialState'
import {IStoreHistoricState, IStoreAhistoricSTate} from '../types'

export const initialPersistedState: IStoreHistoricState = {
  common,
  workspace,
  historicComponentModel,
}

export const initialAhistoricState: IStoreAhistoricSTate = {
  stateIsHydrated: false,
  pathToProject: undefined,
  ahistoricComponentModel,
}
