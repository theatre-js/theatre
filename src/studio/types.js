// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import type {ComponentModelNamespaceState} from '$studio/componentmodel/types'

export type CoreState = {
  common: CommonNamespaceState,
  workspace: WorkspaceNamespaceState,
  componentmodel: ComponentModelNamespaceState,
}