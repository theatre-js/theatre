import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PathToProp} from '@theatre/utils/pathToProp'
import stableValueHash from '@theatre/utils/stableJsonStringify'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {KeyframeId, SequenceTrackId} from '@theatre/core/types/public'
import type {StudioSheetItemKey} from '@theatre/core/types/private'

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
