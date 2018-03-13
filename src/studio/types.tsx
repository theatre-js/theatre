import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {IComponentModelNamespaceState} from '$studio/componentModel/types'
import {StateWithHistory} from '$src/shared/utils/redux/historyReducer/wrapReducerWithHistory'

export interface IStorePersistedState {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  componentModel: IComponentModelNamespaceState
}

export interface IStoreState extends StateWithHistory<IStorePersistedState> {}

export type Selector<ReturnType, ParamsType> = (
  state: IStoreState,
  params: ParamsType,
) => ReturnType
