// @flow
import type {CommonNamespaceState} from '$studio/common/types'
import type {WorkspaceNamespaceState} from '$studio/workspace/types'
import * as DataVerse from '$shared/DataVerse'

export type CoreState = DataVerse.MapOfReferences<{
  persistentState: DataVerse.MapOfReferences<{
    common: CommonNamespaceState,
    workspace: WorkspaceNamespaceState,
  }>,
  coreComponents: DataVerse.MapOfReferences<$FixMe>,
}>