import {
  TExtremums,
  TPoints,
  TPointCoords,
  TPointTime,
  TPointValue,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

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

export type TSelectionAPI = {
  addPoint: (
    itemKey: string,
    pointIndex: number,
    extremums: TExtremums,
    pointData: TPointCoords,
  ) => void
  removePoint: (itemKey: string, pointIndex: number) => void
  getSelectedPointsOfItem: (itemKey: string) => undefined | TCollectionOfSelectedPointsData
}

export type THorizontalLimits = {left: number; right: number}

export type TCollectionOfSelectedPointsData = {
  [pointIndex: string]: TPointTime & Partial<TPointValue>
}

export type TExtremumsMap = {
  [itemKey: string]: TExtremums
}

export type TMapOfFilteredItemKeyToItemData = {
  [itemKey: string]: Pick<
    PrimitivePropItem,
    'address' | 'height' | 'top' | 'expanded'
  > & {
    points: TPoints
  }
}
