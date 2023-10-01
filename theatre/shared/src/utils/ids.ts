import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PathToProp} from '@theatre/utils/pathToProp'
import stableValueHash from '@theatre/utils/stableJsonStringify'
import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {
  KeyframeId,
  SequenceTrackId,
  SequenceMarkerId,
  StudioSheetItemKey,
} from '@theatre/sync-server/state/types'

export function asKeyframeId(s: string): KeyframeId {
  return s as KeyframeId
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
  forSheet(): StudioSheetItemKey {
    return 'sheet' as StudioSheetItemKey
  },
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
  forTrackKeyframe(
    obj: SheetObject,
    trackId: SequenceTrackId,
    keyframeId: KeyframeId,
  ): StudioSheetItemKey {
    return stableValueHash({
      o: obj.address.objectKey,
      t: trackId,
      k: keyframeId,
    }) as StudioSheetItemKey
  },
  forSheetObjectAggregateKeyframe(
    obj: SheetObject,
    position: number,
  ): StudioSheetItemKey {
    return createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
      obj,
      [],
      position,
    )
  },
  forSheetAggregateKeyframe(obj: Sheet, position: number): StudioSheetItemKey {
    return stableValueHash({
      o: obj.address.sheetId,
      pos: position,
    }) as StudioSheetItemKey
  },
  forCompoundPropAggregateKeyframe(
    obj: SheetObject,
    pathToProp: PathToProp,
    position: number,
  ): StudioSheetItemKey {
    return stableValueHash({
      o: obj.address.objectKey,
      p: pathToProp,
      pos: position,
    }) as StudioSheetItemKey
  },
}
