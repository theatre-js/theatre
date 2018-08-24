import {
  TRange,
  TDuration,
  TColor,
} from '$tl/ui/panels/AllInOnePanel/Right/types'

export const getSvgWidth = (
  range: TRange,
  duration: TDuration,
  width: number,
) => {
  return ((duration / (range.to - range.from)) * width) | 0
}

export const inRangeTimeToX = (range: TRange, width: number) => (
  time: number,
) => {
  return ((time - range.from) / (range.to - range.from)) * width
}

export const xToInRangeTime = (range: TRange, width: number) => (x: number) => {
  return (x * (range.to - range.from)) / width + range.from
}

export const timeToX = (duration: number, width: number) => (time: number) => {
  return (time * width) / duration
}

export const xToTime = (duration: number, width: number) => (x: number) => {
  return (x * duration) / width
}

export const deltaXToInRangeTime = (range: TRange, width: number) => (
  dx: number,
) => {
  return (dx * (range.to - range.from)) / width
}

export const color: TColor = {
  name: 'blue',
  normal: '#3AAFA9',
  darkened: '#345b59',
}
