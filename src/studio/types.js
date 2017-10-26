// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import type {ComponentModelNamespaceState} from '$studio/componentModel/types'
import type {AnimationTimelineNamespaceState} from '$studio/animationTimeline/types'
import type {X2NamespaceState} from '$studio/x2/types'

export type StoreState = {
  common: CommonNamespaceState,
  workspace: WorkspaceNamespaceState,
  componentModel: ComponentModelNamespaceState,
  animationTimeline: AnimationTimelineNamespaceState,
  x2: X2NamespaceState,
}

export type Selector<ReturnType, ParamsType> =
  (state: StoreState, params: ParamsType) => ReturnType