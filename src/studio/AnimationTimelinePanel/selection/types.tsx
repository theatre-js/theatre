import {VariableID} from '$studio/AnimationTimelinePanel/types'

export type TDims = {
  left: number
  top: number
  width: number
  height: number
}

export type TBoxesBoundaries = number[]

export type TSelectionMove = {x: number; y: number}

export type TTransformedSelectedArea = {
  [boxIndex: number]: {
    left: number
    top: number
    right: number
    bottom: number
  }
}

export type TPointData = {
  time: number
  value: number
}

export type TSelectedPoints = {
  [boxIndex: string]: {
    [variableId: string]: {
      [pointIndex: string]: TPointData
    }
  }
}

export type TExtremumsMap = {
  [variableId: string]: [number, number]
}

export type TSelectionAPI = {
  addPoint: (
    boxIndex: number,
    variableId: VariableID,
    variableExtremums: [number, number],
    pointIndex: number,
    pointData: TPointData,
  ) => void
  removePoint: (
    boxIndex: number,
    variableId: string,
    pointIndex: number,
  ) => void
}

export type THorizontalLimits = {left: number; right: number}
