import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {ComponentModelNamespaceState} from '$studio/componentModel/types'
import {AnimationTimelineNamespaceState} from '$studio/animationTimeline/types'
import {ComposePanelNamespaceState} from '$studio/composePanel/types'

// @ts-ignore @todo
export type StoreState = {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  componentModel: ComponentModelNamespaceState
  animationTimeline: AnimationTimelineNamespaceState
  composePanel: ComposePanelNamespaceState
}

export type Selector<ReturnType, ParamsType> = (
  state: StoreState,
  params: ParamsType,
) => ReturnType
