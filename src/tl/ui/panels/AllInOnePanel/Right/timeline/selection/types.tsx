import {TExtremums, TPointCoords, TPoints} from '$tl/ui/panels/AllInOnePanel/Right/types'

export type TDims = {
  left: number
  top: number
  width: number
  height: number
}

export type TItemsInfo = {
  boundaries: number[]
  keys: string[]
}

export type TSelectionMove = {x: number; y: number}

export type TTransformedSelectedArea = {
  [itemKey: string]: {
    left: number
    top: number
    right: number
    bottom: number
  }
}

export type TSelectedPoints = {
  [itemKey: string]: {
    [pointIndex: string]: TPointCoords
  }
}

export type TExtremumsMap = {
  [itemKey: string]: TExtremums
}

export type TSelectionAPI = {
  addPoint: (
    itemKey: string,
    pointIndex: number,
    extremums: TExtremums,
    pointData: TPointCoords,
  ) => void
  removePoint: (itemKey: string, pointIndex: number) => void
}

export type THorizontalLimits = {left: number; right: number}

export type TPointsOfItems = {
  [itemKey: string]: TPoints
}
