import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {
  KeyframeWithTrack,
  TrackWithId,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'

const cache = new WeakMap<
  TrackData,
  [seqPosition: number, nearbyKeyframes: NearbyKeyframes]
>()

const noKeyframes: NearbyKeyframes = {}

const itemKeyCache = new WeakMap<Keyframe, StudioSheetItemKey>()

export function getNearbyKeyframesOfTrack(
  obj: SheetObject,
  track: TrackWithId,
  sequencePosition: number,
): NearbyKeyframes {
  if (track.data.keyframes.length === 0) return noKeyframes

  const cachedItem = cache.get(track.data)
  if (cachedItem && cachedItem[0] === sequencePosition) {
    return cachedItem[1]
  }

  function getKeyframeWithTrackId(idx: number): KeyframeWithTrack | undefined {
    const kf = track.data.keyframes[idx]
    if (!kf) return

    // use a cache to avoid extra string manipulation code involved with createStudioSheetItemKey
    let itemKey = itemKeyCache.get(kf)
    if (!itemKey) {
      itemKey = createStudioSheetItemKey.forTrackKeyframe(obj, track.id, kf.id)
      itemKeyCache.set(kf, itemKey)
    }

    return {
      kf,
      track,
      itemKey,
    }
  }

  const calculate = (): NearbyKeyframes => {
    const nextOrCurIdx = track.data.keyframes.findIndex(
      (kf) => kf.position >= sequencePosition,
    )

    if (nextOrCurIdx === -1) {
      return {
        prev: getKeyframeWithTrackId(track.data.keyframes.length - 1),
      }
    }

    const nextOrCur = getKeyframeWithTrackId(nextOrCurIdx)!
    if (nextOrCur.kf.position === sequencePosition) {
      return {
        prev: getKeyframeWithTrackId(nextOrCurIdx - 1),
        cur: nextOrCur,
        next: getKeyframeWithTrackId(nextOrCurIdx + 1),
      }
    } else {
      return {
        next: nextOrCur,
        prev: getKeyframeWithTrackId(nextOrCurIdx - 1),
      }
    }
  }

  const result = calculate()
  cache.set(track.data, [sequencePosition, result])

  return result
}

export type NearbyKeyframes = {
  prev?: KeyframeWithTrack
  cur?: KeyframeWithTrack
  next?: KeyframeWithTrack
}
