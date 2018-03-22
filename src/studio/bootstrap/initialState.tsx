import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentModel} from '$studio/componentModel/initialState'
import {IStorePersistedState, IStoreAhistoricSTate} from '../types'

export const initialPersistedState: IStorePersistedState = {
  common,
  workspace,
  componentModel,
}

export const initialAhistoricState: IStoreAhistoricSTate = {
  stateIsHydrated: false,
  pathToProject: undefined,
}
