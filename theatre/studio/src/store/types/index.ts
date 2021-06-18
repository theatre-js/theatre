import type {StudioAhistoricState} from './ahistoric'
import type {StudioEphemeralState} from './ephemeral'
import type {StudioHistoricState} from './historic'
export * from './ahistoric'
export * from './ephemeral'
export * from './historic'

export type StudioState = {
  historic: StudioHistoricState
  ahistoric: StudioAhistoricState
  ephemeral: StudioEphemeralState
}
