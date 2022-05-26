import getStudio from '@theatre/studio/getStudio'
import {val} from '@theatre/dataverse'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {IUtilLogger} from '@theatre/shared/logger'
import {encodePathToProp} from '@theatre/shared/utils/addresses'

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
}

export type KeyframeWithTrack = {
  kf: Keyframe
  track: TrackWithId
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
  logger: IUtilLogger,
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_SheetObject,
): AggregatedKeyframes {
  const sheetObject = leaf.sheetObject

  const projectId = sheetObject.address.projectId

  const sheetObjectTracksP =
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[
      sheetObject.address.sheetId
    ].sequence.tracksByObject[sheetObject.address.objectKey]

  const aggregatedKeyframes: AggregatedKeyframes[] = []
  const childSimpleTracks: TrackWithId[] = []
  for (const childLeaf of leaf.children) {
    if (childLeaf.type === 'primitiveProp') {
      const trackId = val(
        sheetObjectTracksP.trackIdByPropPath[
          encodePathToProp(childLeaf.pathToProp)
        ],
      )
      if (!trackId) {
        logger.trace('missing track id?', {childLeaf})
        continue
      }

      const trackData = val(sheetObjectTracksP.trackData[trackId])
      if (!trackData) {
        logger.trace('missing track data?', {trackId, childLeaf})
        continue
      }

      childSimpleTracks.push({id: trackId, data: trackData})
    } else if (childLeaf.type === 'propWithChildren') {
      aggregatedKeyframes.push(
        collectAggregateKeyframesInPrism(
          logger.named('propWithChildren', childLeaf.pathToProp.join()),
          childLeaf,
        ),
      )
    } else {
      const _exhaustive: never = childLeaf
      logger.error('unexpected kind of prop', {childLeaf})
    }
  }

  logger.trace('see collected of children', {
    aggregatedKeyframes,
    childSimpleTracks,
  })

  const tracks = aggregatedKeyframes
    .flatMap((a) => a.tracks)
    .concat(childSimpleTracks)

  const byPosition = new Map<number, KeyframeWithTrack[]>()

  for (const track of tracks) {
    const kfs = track.data.keyframes
    for (let i = 0; i < kfs.length; i++) {
      const kf = kfs[i]
      let existing = byPosition.get(kf.position)
      if (!existing) {
        existing = []
        byPosition.set(kf.position, existing)
      }
      existing.push({kf, track})
    }
  }

  return {
    byPosition,
    tracks,
  }
}
