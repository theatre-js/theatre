import {
  IRange,
  IDuration,
  INumberTuple,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {SVG_PADDING_X} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'
import {clamp} from 'lodash-es'
import {millisecsToHumanReadableTimestamp} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'

// scrollSpace.width
export const getScrollSpaceWidth_deprecated = (
  range: IRange,
  duration: IDuration,
  viewportWidth: number,
) => {
  const rangeDuration = range.to - range.from
  return (duration / rangeDuration) * viewportWidth
}

export const anySpace_xToTime = (duration: number, width: number) => (
  x: number,
) => {
  return (x * duration) / width
}

export const timelineXToTime = (range: IRange, timelineWidth: number) => (
  x: number,
) => {
  return deltaTimelineXToDeltaTime(range, timelineWidth)(x) + range.from
}

export const deltaTimelineXToDeltaTime = (
  range: IRange,
  timelineWidth: number,
) => (x: number) => {
  return (x * (range.to - range.from)) / timelineWidth
}

export const timeToTimelineX = (range: IRange, timelineWidth: number) => (
  time: number,
) => {
  return ((time - range.from) / (range.to - range.from)) * timelineWidth
}

export const deltaXToTime = (range: IRange, width: number) => (dx: number) => {
  return (dx * (range.to - range.from)) / width
}

export const getSvgXToPaddedSvgXOffset = (svgWidth: number) => (
  svgX: number,
) => {
  return (1 / 2 - svgX / svgWidth) * SVG_PADDING_X
}

export const inRangeXToPaddedScrollSpaceX = (
  timelineX: number,
  range: IRange,
  duration: IDuration,
  timelineWidth: number,
) => {
  const scrollSpaceWidth = getScrollSpaceWidth_deprecated(
    range,
    duration,
    timelineWidth,
  )
  const svgX = inRangeXToSvgX(timelineX, range, duration, timelineWidth)
  return timelineX + getSvgXToPaddedSvgXOffset(scrollSpaceWidth)(svgX)
}

export const inRangeXToSvgX = (
  timelineX: number,
  range: IRange,
  duration: IDuration,
  timelineWidth: number,
) => {
  const time = timelineXToTime(range, timelineWidth)(timelineX)
  return timeToSvgX(range, duration, timelineWidth)(time)
}

export const viewportScrolledSpace = {
  xToTime: (range: IRange, duration: IDuration, timelineWidth: number) => (
    timelineX: number,
    shouldClamp: boolean = true,
  ) => {
    const svgWidth = getScrollSpaceWidth_deprecated(
      range,
      duration,
      timelineWidth,
    )
    const svgX = inRangeXToSvgX(timelineX, range, duration, timelineWidth)
    const theX = timelineX - getSvgXToPaddedSvgXOffset(svgWidth)(svgX)
    const time = timelineXToTime(range, timelineWidth)(theX)
    return shouldClamp ? clamp(time, 0, duration) : time
  },
}

export const timeToInRangeX = (
  range: IRange,
  duration: IDuration,
  timelineWidth: number,
) => (time: number) => {
  const timelineX = timeToTimelineX(range, timelineWidth)(time)
  return inRangeXToPaddedScrollSpaceX(timelineX, range, duration, timelineWidth)
}

// current
const timeToSvgX = (
  range: IRange,
  duration: IDuration,
  timelineWidth: number,
) => {
  const width = getScrollSpaceWidth_deprecated(range, duration, timelineWidth)
  return (time: number) => {
    return (time * width) / duration
  }
}

export const getRangeLabel = (
  range: IRange,
  duration: IDuration,
  timelineWidth: number,
) => (rangeTime: number) => {
  let rangeX = timeToSvgX(range, duration, timelineWidth)(rangeTime)
  const svgWidth = getScrollSpaceWidth_deprecated(
    range,
    duration,
    timelineWidth,
  )
  rangeX = clamp(
    rangeX - getSvgXToPaddedSvgXOffset(svgWidth)(rangeX),
    0,
    svgWidth,
  )
  return millisecsToHumanReadableTimestamp(
    anySpace_xToTime(duration, svgWidth)(rangeX),
  )
}

export const isNumberTupleZero = (tuple: INumberTuple) => {
  return tuple[0] === tuple[1] && tuple[0] === 0
}
