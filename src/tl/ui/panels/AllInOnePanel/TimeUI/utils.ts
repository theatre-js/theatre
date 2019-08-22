import {
  timelineXToTime,
  timeToTimelineX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {IRange, IDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'

export const getNewTime = (
  range: IRange,
  currentTime: number,
  width: number,
  deltaX: number,
): number => {
  const currentTimeX = timeToTimelineX(range, width)(currentTime)
  const newTime = timelineXToTime(range, width)(currentTimeX + deltaX)
  return clampTime(range, newTime)
}

export const clampTime = (range: IRange, time: number): number => {
  if (time < range.from) time = range.from
  if (time > range.to) time = range.to
  return time
}

export const getNewRange = (
  range: IRange,
  change: IRange,
  duration: IDuration,
  bringRangeToBackIfRangeFromIsSubzero: boolean = true,
): IRange => {
  const newRange = {from: range.from + change.from, to: range.to + change.to}
  if (newRange.to - newRange.from < 1) {
    if (newRange.from === range.from) {
      newRange.to = range.from + 1
    } else {
      newRange.from = range.to - 1
    }
  }

  if (newRange.from < 0) {
    newRange.from = 0
    if (bringRangeToBackIfRangeFromIsSubzero)
      newRange.to = range.to - range.from
  }
  if (newRange.to > duration) {
    newRange.from = duration - (range.to - range.from)
    newRange.to = duration
  }

  return newRange
}

export const getNewZoom = (
  range: IRange,
  change: IRange,
  duration: IDuration,
) => {
  const newRange = {from: range.from + change.from, to: range.to + change.to}
  if (newRange.from < 0) {
    newRange.from = 0
  }
  if (newRange.to > duration) {
    newRange.to = duration
  }
  return newRange.to - newRange.from < 1 ? range : newRange
}

export const overshootDuration = (timelineDuration: number) =>
  timelineDuration + 2000
