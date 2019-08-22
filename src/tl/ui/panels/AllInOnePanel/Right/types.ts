import {
  ITimelineVarPointWithValueNumber,
  IBezierCurvesOfScalarValues,
  ITimelinePointSingleHandle,
} from '$tl/Project/store/types'
// import {RangeState} from '$tl/timelines/TimelineTemplate'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

// Point
export type IPoint = ITimelineVarPointWithValueNumber
export type IPoints = IBezierCurvesOfScalarValues['points']
export type IPointSingleHandle = ITimelinePointSingleHandle
export type IPointHandles = IPoint['interpolationDescriptor']['handles']
export type IPointCoords = Pick<IPoint, 'time' | 'value'>
export type IPointTime = Pick<IPoint, 'time'>
export type IPointValue = Pick<IPoint, 'value'>
export type INormalizedPoint = IPoint & {
  originalTime: number
  originalValue: number
}
export type INormalizedPoints = INormalizedPoint[]
export type IExtremums = INumberTuple

// Range state
export type IRange = {from: number; to: number}
export type IDuration = number

// item
export type IExpanded = PrimitivePropItem['expanded']

// Misc
export type IColor = {
  name: string
  normal: string
  darkened: string
}

export type INumberTuple = [number, number]
