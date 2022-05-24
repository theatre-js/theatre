import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PathToProp} from './addresses'
import stableValueHash from './stableJsonStringify'
import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import type {Nominal} from './Nominal'

export type KeyframeId = Nominal<'KeyframeId'>

export function generateKeyframeId(): KeyframeId {
  return generateNonSecure(10) as KeyframeId
}

export function asKeyframeId(s: string): KeyframeId {
  return s as KeyframeId
}

export type ProjectId = Nominal<'ProjectId'>
export type SheetId = Nominal<'SheetId'>
export type SheetInstanceId = Nominal<'SheetInstanceId'>
export type PaneInstanceId = Nominal<'PaneInstanceId'>
export type SequenceTrackId = Nominal<'SequenceTrackId'>
export type SequenceMarkerId = Nominal<'SequenceMarkerId'>
export type ObjectAddressKey = Nominal<'ObjectAddressKey'>

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

export function generateSequenceTrackId(): SequenceTrackId {
  return generateNonSecure(10) as SequenceTrackId
}

export function asSequenceTrackId(s: string): SequenceTrackId {
  return s as SequenceTrackId
}

export function generateSequenceMarkerId(): SequenceMarkerId {
  return generateNonSecure(10) as SequenceMarkerId
}

/**
 * This will not necessarily maintain consistent key values if any
 * versioning happens where something needs to
 */
export const createStudioSheetItemKey = {
  forSheetObject(obj: SheetObject): StudioSheetItemKey {
    return stableValueHash({
      o: obj.address.objectKey,
    }) as StudioSheetItemKey
  },
  forSheetObjectProp(
    obj: SheetObject,
    pathToProp: PathToProp,
  ): StudioSheetItemKey {
    return stableValueHash({
      o: obj.address.objectKey,
      p: pathToProp,
    }) as StudioSheetItemKey
  },
}
