import {CommonNamespaceState} from '$theater/common/types'
import {
  IWorkspaceNamespaceHistoricState,
  IWorkspaceNamespaceAHistoricState,
} from '$theater/workspace/types'
import {
  IComponentModelNamespaceHistoricState,
  IComponentModelNamespaceAhistoricState,
} from '$theater/componentModel/types'
import {
  StateWithHistory,
  HistoryOnly,
} from '$shared/utils/redux/withHistory/withHistory'
import {Pointer} from '$shared/DataVerse2/pointer'
import * as t from 'io-ts'

export interface IStoreHistoricState {
  common: CommonNamespaceState
  historicWorkspace: IWorkspaceNamespaceHistoricState
  historicComponentModel: IComponentModelNamespaceHistoricState
}

const RStoreHistoricState = t.type(
  {
    common: t.type({}, 'Theater/Store/HistoricState/Common'),
  },
  'Theater/Store/HistoricState',
)

const RStoreAhistoricState = t.type(
  {
    stateIsHydrated: t.boolean,
  },
  'Theater/Store/HistoricState',
)

export const RStoreState = t.intersection(
  [RStoreHistoricState, RStoreAhistoricState],
  'Theater/Store/State',
)

export interface IStoreAhistoricSTate {
  stateIsHydrated: boolean
  pathToProject: undefined | string
  ahistoricComponentModel: IComponentModelNamespaceAhistoricState
  ahistoricWorkspace: IWorkspaceNamespaceAHistoricState
}

export interface ITheaterStoreState
  extends StateWithHistory<IStoreHistoricState, IStoreAhistoricSTate> {}

export interface ITheaterHistoryState
  extends HistoryOnly<IStoreHistoricState> {}

export type Selector<ReturnType, ParamsType = void> = ParamsType extends void
  ? (((state: ITheaterStoreState) => ReturnType) &
      ((state: Pointer<ITheaterStoreState>) => Pointer<ReturnType>))
  : (((state: ITheaterStoreState, params: ParamsType) => ReturnType) &
      ((
        state: Pointer<ITheaterStoreState>,
        params: ParamsType,
      ) => Pointer<ReturnType>))
