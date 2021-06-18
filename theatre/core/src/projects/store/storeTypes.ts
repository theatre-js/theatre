import type {StrictRecord} from '@theatre/shared/utils/types'
import type {SheetState_Historic} from './types/SheetState_Historic'

export interface ProjectLoadedState {
  type: 'loaded'
}

type ProjectLoadingState =
  | {type: 'loading'}
  | ProjectLoadedState
  | {
      type: 'browserStateIsNotBasedOnDiskState'
      onDiskState: OnDiskState
    }

/**
 * Ahistoric state is persisted, but its changes
 * are not undoable.
 */
export interface ProjectAhistoricState {
  ahistoricStuff: string
}

/**
 * Ephemeral state is neither persisted nor undoable
 */
export interface ProjectEphemeralState {
  loadingState: ProjectLoadingState
  lastExportedObject: null | OnDiskState
}

/**
 * Historic state is both persisted and is undoable
 */
export interface ProjectState_Historic {
  sheetsById: StrictRecord<string, SheetState_Historic>
  exportBookkeeping?: {revision: string; basedOnRevisions: string[]}
  definitionVersion: string
}

export interface ProjectState {
  historic: ProjectState_Historic
  ahistoric: ProjectAhistoricState
  ephemeral: ProjectEphemeralState
}

export interface OnDiskState extends ProjectState_Historic {
  exportBookkeeping: {revision: string; basedOnRevisions: string[]}
}
