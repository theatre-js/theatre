import {
  TExtremums,
  TPoints,
  TPointCoords,
  TPointTime,
  TPointValue,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import {PropAddress} from '$tl/handy/addresses'

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

export type TSelectedPointsInItem = {
  [pointIndex: string]: TPointCoords
}

export type TSelectedPoints = {
  [itemKey: string]: TSelectedPointsInItem
}

export type TSelectionAPI = {
  addPoint: (
    itemKey: string,
    pointIndex: number,
    extremums: TExtremums,
    pointData: TPointCoords,
  ) => boolean
  removePoint: (itemKey: string, pointIndex: number) => boolean
  getSelectedPointsOfItem: (
    itemKey: string,
  ) => undefined | TSelectedPointsInItem
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

export type TLastCommittedData = Array<{
  propAddress: PropAddress
  pointsNewCoords: TCollectionOfSelectedPointsData
}>
