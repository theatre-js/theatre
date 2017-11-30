// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import type {ComponentModelNamespaceState} from '$studio/componentModel/types'
import type {AnimationTimelineNamespaceState} from '$studio/animationTimeline/types'
import type {ComposePanelNamespaceState} from '$studio/composePanel/types'

export type StoreState = {
  common: CommonNamespaceState,
  workspace: WorkspaceNamespaceState,
  componentModel: ComponentModelNamespaceState,
  animationTimeline: AnimationTimelineNamespaceState,
  composePanel: ComposePanelNamespaceState,
}

export type Selector<ReturnType, ParamsType> = (
  state: StoreState,
  params: ParamsType,
) => ReturnType
