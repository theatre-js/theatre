import type {SheetId} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'
import type {SheetState_Historic} from './types/SheetState_Historic'

type ProjectLoadingState =
  | {type: 'loading'}
  | {type: 'loaded'}
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
 * This is the state of each project that is consumable by `@theatre/core`.
 * If the studio is present, this part of the state joins the studio's historic state,
 * at {@link StudioHistoricState.coreByProject}
 */
export interface ProjectState_Historic {
  sheetsById: StrictRecord<SheetId, SheetState_Historic>
  /**
   * The last 50 revision IDs this state is based on, starting with the most recent one.
   * The most recent one is the revision ID of this state
   */
  revisionHistory: string[]
  definitionVersion: string
}

export interface ProjectState {
  historic: ProjectState_Historic
  ahistoric: ProjectAhistoricState
  ephemeral: ProjectEphemeralState
}

export interface OnDiskState extends ProjectState_Historic {}
