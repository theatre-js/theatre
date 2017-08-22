// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'

export type StoreState = {
  common: CommonNamespaceState,
  workspace: WorkspaceNamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType