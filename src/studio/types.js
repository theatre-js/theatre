// @flow
import type {CommonNamespaceState} from '$studio/common/types'

export type StoreState = {
  common: CommonNamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType