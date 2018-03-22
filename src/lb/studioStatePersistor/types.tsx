import {IStudioHistoryState} from '$studio/types'

export interface StudioStatePersistorNamespaceState {
  byPath: Record<string, StateWithCacheData>
}

export interface StateWithCacheData {
  state: PossibleStates
  lastRead: number
}

export type PossibleStates = EmptyState | FullState

type EmptyState = {type: 'empty'}
type FullState = {type: 'full'; checksum: string; state: IStudioHistoryState}
