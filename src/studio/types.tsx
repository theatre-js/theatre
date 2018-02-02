import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {IComponentModelNamespaceState} from '$studio/componentModel/types'
import {AnimationTimelineNamespaceState} from '$studio/animationTimeline/types'
import {ComposePanelNamespaceState} from '$studio/composePanel/types'

// @ts-ignore @todo
export interface IStoreState {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  componentModel: IComponentModelNamespaceState
  animationTimeline: AnimationTimelineNamespaceState
  composePanel: ComposePanelNamespaceState
}

export type Selector<ReturnType, ParamsType> = (
  state: IStoreState,
  params: ParamsType,
) => ReturnType
