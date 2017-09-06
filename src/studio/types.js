// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import coreComponents from '$studio/componentModel/coreComponents'

export type CoreState = {
  persistentState: {
    common: CommonNamespaceState,
    workspace: WorkspaceNamespaceState,
  },
  coreComponents: typeof coreComponents,
}