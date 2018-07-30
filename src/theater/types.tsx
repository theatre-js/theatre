import {$IComponentModelNamespaceHistoricState} from './componentModel/types'
import {$IWorkspaceAhistoricState} from './workspace/types'
import {
  ICommonNamespaceState,
  $ICommonNamespaceState,
} from '$theater/common/types'
import {
  IWorkspaceHistoricState,
  IWorkspaceAhistoricState,
  $IWorkspaceHistoricState,
} from '$theater/workspace/types'
import {
  IComponentModelNamespaceHistoricState,
  IComponentModelNamespaceAhistoricState,
} from '$theater/componentModel/types'
import {
  StateWithHistory,
  HistoryOnly,
} from '$shared/utils/redux/withHistory/withHistoryDeprecated'
import {Pointer} from '$shared/DataVerse2/pointer'
import * as t from '$shared/ioTypes'

export interface IStoreHistoricState {
  common: ICommonNamespaceState
  historicWorkspace: IWorkspaceHistoricState
  historicComponentModel: IComponentModelNamespaceHistoricState
}

const $IStoreHistoricState = t.type(
  {
    common: $ICommonNamespaceState,
    historicWorkspace: $IWorkspaceHistoricState,
    historicComponentModel: $IComponentModelNamespaceHistoricState,
  },
  'StoreHistoricState',
)

export const $IStoreAhistoricState = t.type({
  stateIsHydrated: t.boolean,
  pathToProject: t.union([t.undefined, t.string]),
  ahistoricWorkspace: $IWorkspaceAhistoricState,
}, 'StoreAhistoricState')
// export type IStoreAhistoricState = t.TypeOf<typeof $IStoreAhistoricState>

export interface IStoreAhistoricState {
  stateIsHydrated: boolean
  pathToProject: undefined | string
  ahistoricComponentModel: IComponentModelNamespaceAhistoricState
  ahistoricWorkspace: IWorkspaceAhistoricState
}

export const RStoreState = t.intersection(
  [$IStoreHistoricState, $IStoreAhistoricState],
  'StoreState',
)

export interface ITheaterStoreState
  extends StateWithHistory<IStoreHistoricState, IStoreAhistoricState> {}

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
