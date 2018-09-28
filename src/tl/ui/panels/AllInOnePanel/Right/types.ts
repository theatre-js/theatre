import {
  ITimelineVarPointWithValueNumber,
  IBezierCurvesOfScalarValues,
  ITimelinePointSingleHandle,
} from '$tl/Project/store/types'
// import {RangeState} from '$tl/timelines/InternalTimeline'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

// Point
export type TPoint = ITimelineVarPointWithValueNumber
export type TPoints = IBezierCurvesOfScalarValues['points']
export type TPointSingleHandle = ITimelinePointSingleHandle
export type TPointHandles = TPoint['interpolationDescriptor']['handles']
export type TPointCoords = Pick<TPoint, 'time' | 'value'>
export type TPointTime = Pick<TPoint, 'time'>
export type TPointValue = Pick<TPoint, 'value'>
export type TNormalizedPoint = TPoint & {
  originalTime: number
  originalValue: number
}
export type TNormalizedPoints = TNormalizedPoint[]
export type TExtremums = TNumberTuple

// Range state
export type TRange = {from: number, to: number}
export type TDuration = number

// item
export type TExpanded = PrimitivePropItem['expanded']

// Misc
export type TColor = {
  name: string
  normal: string
  darkened: string
}

export type TNumberTuple = [number, number]
