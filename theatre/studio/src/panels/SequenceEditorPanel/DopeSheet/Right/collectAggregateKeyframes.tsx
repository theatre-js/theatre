import getStudio from '@theatre/studio/getStudio'
import {val} from '@theatre/dataverse'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_Sheet,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {
  SequenceTrackId,
  StudioSheetItemKey,
} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import {uniq} from 'lodash-es'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

/**
 * An index over a series of keyframes that have been collected from different tracks.
 *
 * Usually constructed via {@link collectAggregateKeyframesInPrism}.
 */
export type AggregatedKeyframes = {
  byPosition: Map<number, KeyframeWithTrack[]>
  tracks: TrackWithId[]
}

export type TrackWithId = {
  id: SequenceTrackId
  data: TrackData
  sheetObject: SheetObject
}

export type KeyframeWithTrack = {
  kf: Keyframe
  track: TrackWithId
  itemKey: StudioSheetItemKey
}

/**
 * Collect {@link AggregatedKeyframes} information from the given tree row with children.
 *
 * Must be called within a `prism` context.
 *
 * Implementation progress 2/10:
 *  - This currently does a lot of duplicate work for each compound rows' compound rows.
 *    - This appears to have O(N) complexity with N being the number of "things" in the
 *      tree, thus we don't see an immediate need to cache it further.
 *    - If concerned, consider making a playground with a lot of objects to test this kind of thing.
 *
 * Note that we do not need to filter to only tracks that should be displayed, because we
 * do not do anything counting or iterating over all tracks.
 *
 * Furthermore, we _could_ have been traversing the tree of the sheet and producing
 * an aggreagte from that, but _that_ aggregate would not take into account
 * things like filters in the `SequenceEditorPanel`, where the filter would exclude
 * certain objects and props from the tree.
 *
 */
export function collectAggregateKeyframesInPrism(
  leaf:
    | SequenceEditorTree_Sheet
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject,
): AggregatedKeyframes {
  const tracks =
    leaf.type === 'sheet'
      ? collectAggregateKeyframesSheet(leaf)
      : collectAggregateKeyframesCompoundOrObject(leaf)

  return {
    byPosition: keyframesByPositionFromTrackWithIds(tracks),
    tracks,
  }
}

function keyframesByPositionFromTrackWithIds(tracks: TrackWithId[]) {
  const byPosition = new Map<number, KeyframeWithTrack[]>()

  for (const track of tracks) {
    for (const kf of track.data.keyframes) {
      let existing = byPosition.get(kf.position)
      if (!existing) {
        existing = []
        byPosition.set(kf.position, existing)
      }
      existing.push({
        kf,
        track,
        itemKey: createStudioSheetItemKey.forTrackKeyframe(
          track.sheetObject,
          track.id,
          kf.id,
        ),
      })
    }
  }

  return byPosition
}

function collectAggregateKeyframesSheet(
  leaf: SequenceEditorTree_Sheet,
): TrackWithId[] {
  return leaf.children.flatMap(collectAggregateKeyframesCompoundOrObject)
}

function collectAggregateKeyframesCompoundOrObject(
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_SheetObject,
): TrackWithId[] {
  return leaf.children.flatMap((childLeaf) =>
    childLeaf.type === 'propWithChildren'
      ? collectAggregateKeyframesCompoundOrObject(childLeaf)
      : collectAggregateKeyframesPrimitiveProp(childLeaf),
  )
}

function collectAggregateKeyframesPrimitiveProp(
  leaf: SequenceEditorTree_PrimitiveProp,
): TrackWithId[] {
  const sheetObject = leaf.sheetObject

  const projectId = sheetObject.address.projectId

  const sheetObjectTracksP =
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[
      sheetObject.address.sheetId
    ].sequence.tracksByObject[sheetObject.address.objectKey]
  const trackId = val(
    sheetObjectTracksP.trackIdByPropPath[encodePathToProp(leaf.pathToProp)],
  )
  if (!trackId) return []

  const trackData = val(sheetObjectTracksP.trackData[trackId])
  if (!trackData) return []

  return [{id: trackId, data: trackData, sheetObject}]
}

/**
 * Collects all the snap positions for an aggregate track.
 */
export function collectAggregateSnapPositionsSheet(
  leaf: SequenceEditorTree_Sheet,
  snapTargetPositions: {[key: string]: {[key: string]: number[]}},
): number[] {
  return uniq(
    leaf.children.flatMap((childLeaf) =>
      collectAggregateSnapPositionsObjectOrCompound(
        childLeaf,
        snapTargetPositions,
      ),
    ),
  )
}

export function collectAggregateSnapPositionsObjectOrCompound(
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_SheetObject,
  snapTargetPositions: {[key: string]: {[key: string]: number[]}},
): number[] {
  return uniq(
    leaf.children.flatMap((childLeaf) =>
      childLeaf.type === 'propWithChildren'
        ? collectAggregateSnapPositionsObjectOrCompound(
            childLeaf,
            snapTargetPositions,
          )
        : collectAggregateSnapPositionsPrimitiveProp(
            childLeaf,
            snapTargetPositions,
          ),
    ),
  )
}

function collectAggregateSnapPositionsPrimitiveProp(
  leaf: SequenceEditorTree_PrimitiveProp,
  snapTargetPositions: {[key: string]: {[key: string]: number[]}},
): number[] {
  const sheetObject = leaf.sheetObject
  const projectId = sheetObject.address.projectId
  const sheetObjectTracksP =
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[
      sheetObject.address.sheetId
    ].sequence.tracksByObject[sheetObject.address.objectKey]
  const trackId = val(
    sheetObjectTracksP.trackIdByPropPath[encodePathToProp(leaf.pathToProp)],
  )
  if (!trackId) return []

  return snapTargetPositions[sheetObject.address.objectKey]?.[trackId] ?? []
}
