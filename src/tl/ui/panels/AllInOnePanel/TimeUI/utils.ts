import {
  inRangeTimeToX,
  xToInRangeTime,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'

export const getNewTime = (
  range: TRange,
  currentTime: number,
  width: number,
  deltaX: number,
): number => {
  const currentTimeX = inRangeTimeToX(range, width)(currentTime)
  const newTime = xToInRangeTime(range, width)(currentTimeX + deltaX)
  return clampTime(range, newTime)
}

export const clampTime = (range: TRange, time: number): number => {
  if (time < range.from) time = range.from
  if (time > range.to) time = range.to
  return time
}

export const getNewRange = (
  range: TRange,
  change: TRange,
  duration: TDuration,
): TRange => {
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
    newRange.to = range.to - range.from
  }
  if (newRange.to > duration) {
    newRange.from = duration - (range.to - range.from)
    newRange.to = duration
  }
  return newRange
}

export const getNewZoom = (
  range: TRange,
  change: TRange,
  duration: TDuration,
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
