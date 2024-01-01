import type {$IntentionalAny} from '@theatre/core/types/public'
import type {BasicKeyframedTrack} from '@theatre/core/types/private/core'
import memoizeFn from '@theatre/utils/memoizeFn'
import {cloneDeep} from 'lodash-es'
import type {BasicKeyframe} from '@theatre/core/types/public'

export const getSortedKeyframes = (
  keyframes: BasicKeyframedTrack['keyframes'],
): BasicKeyframe[] => {
  const sorted = Object.values(
    keyframes.byId,
  ) as $IntentionalAny as BasicKeyframe[]
  sorted.sort((a, b) => a.position! - b.position!)

  return cloneDeep(sorted)
}

export const getSortedKeyframesCached = memoizeFn(getSortedKeyframes)

export const fromArray = (
  keyframes: BasicKeyframe[],
): BasicKeyframedTrack['keyframes'] => {
  const byId: BasicKeyframedTrack['keyframes']['byId'] = {}
  const allIds: BasicKeyframedTrack['keyframes']['allIds'] = {}

  for (const keyframe of keyframes) {
    byId[keyframe.id] = keyframe
    allIds[keyframe.id] = true
  }

  return cloneDeep({byId, allIds})
}

export const fromSortedKeyframesCached = memoizeFn(fromArray)
