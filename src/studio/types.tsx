import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {IComponentModelNamespaceHistoricState, IComponentModelNamespaceAhistoricState} from '$studio/componentModel/types'
import {StateWithHistory, HistoryOnly} from '$src/shared/utils/redux/withHistory/withHistory'

export interface IStoreHistoricState {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  historicComponentModel: IComponentModelNamespaceHistoricState
}

export interface IStoreAhistoricSTate {
  stateIsHydrated: boolean
  pathToProject: undefined | string
  ahistoricComponentModel: IComponentModelNamespaceAhistoricState
}

export interface IStudioStoreState
  extends StateWithHistory<IStoreHistoricState, IStoreAhistoricSTate> {}

export interface IStudioHistoryState extends HistoryOnly<IStoreHistoricState> {}

export type Selector<ReturnType, ParamsType = void> = 
  ParamsType extends void ? (state: IStudioStoreState) => ReturnType : 
  (
    state: IStudioStoreState,
    params: ParamsType,
  ) => ReturnType
