import {
  ITimelineVarPointWithValueNumber,
  IBezierCurvesOfScalarValues,
} from '$tl/Project/store/types'
import {RangeState} from '$tl/timelines/InternalTimeline'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

// Point
export type TPoint = ITimelineVarPointWithValueNumber
export type TPoints = IBezierCurvesOfScalarValues['points']
export type TPointHandles = TPoint['interpolationDescriptor']['handles']
export type TPointCoords = Pick<TPoint, 'time' | 'value'>
export type TNormalizedPoint = TPoint & {
  originalTime: number
  originalValue: number
}
export type TNormalizedPoints = TNormalizedPoint[]
export type TExtremums = [number, number]

// Range state
export type TRange = RangeState['rangeShownInPanel']
export type TDuration = RangeState['duration']

// item
export type TExpanded = PrimitivePropItem['expanded']

// Misc
export type TColor = {
  name: string
  normal: string
  darkened: string
}
