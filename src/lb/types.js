// @flow
import type {CommonNamespaceState} from '$lb/common/types'

export type StoreState = {
  common: CommonNamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType