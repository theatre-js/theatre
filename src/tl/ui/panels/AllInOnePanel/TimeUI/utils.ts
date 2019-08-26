import {
  timelineXToTime,
  timeToTimelineX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {IRange, IDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {padStart} from 'lodash-es'

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

/**
 * @note we need to put these in a better place.
 */
export const FPS = 30 // @note might someday be configurable.
export const FRAME_DURATION = Number(
  (1000 / FPS).toFixed(6).slice(0, -1),
) /* slice: 6.66667 -> 6.66666*/

export function roundTimeToClosestFrame(time: number, frameDuration: number) {
  const lastSecond = Math.floor(time / 1000) * 1000
  const timePastLastSecond = time % 1000

  const closestFrame =
    Math.round(timePastLastSecond / frameDuration) * frameDuration

  return lastSecond + closestFrame
}

export function makeHumanReadableTimestamp(seconds: number, frame: number) {
  return `${seconds}:${padStart(String(frame), 2, '0')}`
}

export function getSecondsAndFrame(timeInMs: number) {
  const frame = Math.round((timeInMs % 1000) / FRAME_DURATION)
  const s = Math.floor(timeInMs / 1000)
  return {frame, s}
}

export function millisecsToHumanReadableTimestamp(timeInMs: number) {
  const {s, frame} = getSecondsAndFrame(timeInMs)
  return makeHumanReadableTimestamp(s, frame)
}
