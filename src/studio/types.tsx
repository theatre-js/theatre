import {CommonNamespaceState} from '$studio/common/types'
import {
  IWorkspaceNamespaceHistoricState,
  IWorkspaceNamespaceAHistoricState,
} from '$studio/workspace/types'
import {
  IComponentModelNamespaceHistoricState,
  IComponentModelNamespaceAhistoricState,
} from '$studio/componentModel/types'
import {
  StateWithHistory,
  HistoryOnly,
} from '$shared/utils/redux/withHistory/withHistory'
import {Pointer} from '$shared/DataVerse2/pointer'

export interface IStoreHistoricState {
  common: CommonNamespaceState
  historicWorkspace: IWorkspaceNamespaceHistoricState
  historicComponentModel: IComponentModelNamespaceHistoricState
}

export interface IStoreAhistoricSTate {
  stateIsHydrated: boolean
  pathToProject: undefined | string
  ahistoricComponentModel: IComponentModelNamespaceAhistoricState
  ahistoricWorkspace: IWorkspaceNamespaceAHistoricState
}

export interface IStudioStoreState
  extends StateWithHistory<IStoreHistoricState, IStoreAhistoricSTate> {}

export interface IStudioHistoryState extends HistoryOnly<IStoreHistoricState> {}

export type Selector<ReturnType, ParamsType = void> = ParamsType extends void
  ? (((state: IStudioStoreState) => ReturnType) &
      ((state: Pointer<IStudioStoreState>) => Pointer<ReturnType>))
  : (((state: IStudioStoreState, params: ParamsType) => ReturnType) &
      ((
        state: Pointer<IStudioStoreState>,
        params: ParamsType,
      ) => Pointer<ReturnType>))
