import {RangeState} from '$tl/timelines/InternalTimeline'

export const getSvgWidth = (
  range: RangeState['rangeShownInPanel'],
  duration: RangeState['duration'],
  width: number,
) => {
  return ((duration / (range.to - range.from)) * width) | 0
}

export const inRangeTimeToX = (
  range: RangeState['rangeShownInPanel'],
  width: number,
) => (time: number) => {
  return ((time - range.from) / (range.to - range.from)) * width
}

export const xToInRangeTime = (
  range: RangeState['rangeShownInPanel'],
  width: number,
) => (x: number) => {
  return (x * (range.to - range.from)) / width + range.from
}

export const timeToX = (duration: number, width: number) => (time: number) => {
  return (time * width) / duration
}

export const xToTime = (duration: number, width: number) => (x: number) => {
  return (x * duration) / width
}

export const deltaXToInRangeTime = (range: RangeState['rangeShownInPanel'], width: number) => (dx: number) => {
  return (dx * (range.to - range.from)) / width
}
