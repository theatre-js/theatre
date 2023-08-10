import type {StudioAhistoricState} from './ahistoric'
import type {StudioEphemeralState} from './ephemeral'
import type {StudioHistoricState} from './historic'
import type {Nominal} from '@theatre/utils/Nominal'
export * from './ahistoric'
export * from './ephemeral'
export * from './historic'

/**
 * Describes the type of the object inside our store (redux store).
 */
export type StudioState = {
  $schemaVersion: number
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

export type PaneInstanceId = Nominal<'PaneInstanceId'>
export type SequenceMarkerId = Nominal<'SequenceMarkerId'>

/**
 * Studio consistent identifier for identifying any individual item on a sheet
 * including a SheetObject, a SheetObject's prop, etc.
 *
 * See {@link createStudioSheetItemKey}.
 *
 * @remarks
 * This is the kind of type which should not find itself in Project state,
 * due to how it is lossy in the case of additional model layers being introduced.
 * e.g. When we introduce an extra layer of multiple sequences per sheet,
 * all the {@link StudioSheetItemKey}s will have different generated values,
 * because they'll have additional information (the "sequence id"). This means
 * that all data attached to those item keys will become detached.
 *
 * This kind of constraint might be mitigated by a sort of migrations ability,
 * but for the most part it's just going to be easier to try not using
 * {@link StudioSheetItemKey} for any data that needs to stick around after
 * version updates to Theatre.
 *
 * Alternatively, if you did want some kind of universal identifier for any item
 * that can be persisted and survive project model changes, it's probably going
 * to be easier to simply generate a unique id for all items you want to use in
 * this way, and don't do any of this concatenating/JSON.stringify "hashing"
 * stuff.
 */
export type StudioSheetItemKey = Nominal<'StudioSheetItemKey'>
/** UI panels can contain a {@link PaneInstanceId} or something else. */
export type UIPanelId = Nominal<'UIPanelId'>

export type GraphEditorColors = {
  '1': {iconColor: '#b98b08'}
  '2': {iconColor: '#70a904'}
  '3': {iconColor: '#2e928a'}
  '4': {iconColor: '#a943bb'}
  '5': {iconColor: '#b90808'}
  '6': {iconColor: '#b4bf0e'}
}
