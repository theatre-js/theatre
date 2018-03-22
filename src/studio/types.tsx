import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {IComponentModelNamespaceState} from '$studio/componentModel/types'
import {StateWithHistory} from '$src/shared/utils/redux/withHistory/withHistory'

export interface IStorePersistedState {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  componentModel: IComponentModelNamespaceState
}

export interface IStoreAhistoricSTate {
  stateIsHydrated: boolean
  pathToProject: undefined | string
}

export interface IStudioStoreState
  extends StateWithHistory<IStorePersistedState, IStoreAhistoricSTate> {}

export type Selector<ReturnType, ParamsType = void> = 
  ParamsType extends void ? (state: IStudioStoreState) => ReturnType : 
  (
    state: IStudioStoreState,
    params: ParamsType,
  ) => ReturnType
