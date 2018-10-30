import {ITheaterHistoryState} from '$studio/types'

export interface StudioStatePersistorNamespaceState {
  byPath: Record<string, StateWithCacheData>
}

export type StateWithCacheData = PossibleStates & {
  lastRead: number
}

export type PossibleStates = EmptyState | FullState

interface EmptyState {
  checksum: 'empty'
  data: {}
}
interface FullState {
  checksum: string
  data: ITheaterHistoryState
}
