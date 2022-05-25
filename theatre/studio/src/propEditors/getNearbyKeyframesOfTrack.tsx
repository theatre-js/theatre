import type {
  TrackData,
  Keyframe,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import last from 'lodash-es/last'

const cache = new WeakMap<
  TrackData,
  [seqPosition: number, nearbyKeyframes: NearbyKeyframes]
>()

const noKeyframes: NearbyKeyframes = {}

export function getNearbyKeyframesOfTrack(
  track: TrackData | undefined,
  sequencePosition: number,
): NearbyKeyframes {
  if (!track || track.keyframes.length === 0) return noKeyframes

  const cachedItem = cache.get(track)
  if (cachedItem && cachedItem[0] === sequencePosition) {
    return cachedItem[1]
  }

  const calculate = (): NearbyKeyframes => {
    const i = track.keyframes.findIndex((kf) => kf.position >= sequencePosition)

    if (i === -1)
      return {
        prev: last(track.keyframes),
      }

    const k = track.keyframes[i]!
    if (k.position === sequencePosition) {
      return {
        prev: i > 0 ? track.keyframes[i - 1] : undefined,
        cur: k,
        next:
          i === track.keyframes.length - 1 ? undefined : track.keyframes[i + 1],
      }
    } else {
      return {
        next: k,
        prev: i > 0 ? track.keyframes[i - 1] : undefined,
      }
    }
  }

  const result = calculate()
  cache.set(track, [sequencePosition, result])

  return result
}

export type NearbyKeyframes = {
  prev?: Keyframe
  cur?: Keyframe
  next?: Keyframe
}
