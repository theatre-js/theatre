// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import type {AnimationTimelineNamespaceState} from '$studio/animationTimeline/types'

export type StoreState = {
  common: CommonNamespaceState,
  workspace: WorkspaceNamespaceState,
  animationTimeline: AnimationTimelineNamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType