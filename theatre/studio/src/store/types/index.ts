import type {StudioAhistoricState} from './ahistoric'
import type {StudioEphemeralState} from './ephemeral'
import type {StudioHistoricState} from './historic'
export * from './ahistoric'
export * from './ephemeral'
export * from './historic'

/**
 * Describes the type of the object inside our store (redux store).
 */
export type StudioState = {
  /**
   * This is the part of the state that is undo/redo-able
   */
  historic: StudioHistoricState
  /**
   * This is the part of the state that can't be undone, but it's
   * still persisted to localStorage
   */
  ahistoric: StudioAhistoricState
  /**
   * This is entirely ephemeral, and gets lost if user refreshes the page
   */
  ephemeral: StudioEphemeralState
}
