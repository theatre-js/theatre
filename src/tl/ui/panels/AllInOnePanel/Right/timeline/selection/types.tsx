import {
  IExtremums,
  IPoints,
  IPointCoords,
  IPointTime,
  IPointValue,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import {PropAddress} from '$tl/handy/addresses'

export type IDims = {
  left: number
  top: number
  width: number
  height: number
}

export type IItemsInfo = {
  boundaries: number[]
  keys: string[]
}

export type ISelectionMove = {x: number; y: number}

export type ITransformedSelectedArea = {
  [itemKey: string]: {
    left: number
    top: number
    right: number
    bottom: number
  }
}

export type ISelectedPointsInItem = {
  [pointIndex: string]: IPointCoords
}

export type ISelectedPoints = {
  [itemKey: string]: ISelectedPointsInItem
}

export type ISelectionAPI = {
  addPoint: (
    itemKey: string,
    pointIndex: number,
    extremums: IExtremums,
    pointData: IPointCoords,
  ) => boolean
  removePoint: (itemKey: string, pointIndex: number) => boolean
  getSelectedPointsOfItem: (
    itemKey: string,
  ) => undefined | ISelectedPointsInItem
}

export type IHorizontalLimits = {left: number; right: number}

export type ICollectionOfSelectedPointsData = {
  [pointIndex: string]: IPointTime & Partial<IPointValue>
}

export type IExtremumsMap = {
  [itemKey: string]: IExtremums
}

export type IMapOfFilteredItemKeyToItemData = {
  [itemKey: string]: Pick<
    PrimitivePropItem,
    'address' | 'height' | 'top' | 'expanded'
  > & {
    points: IPoints
  }
}

export type ILastCommittedData = Array<{
  propAddress: PropAddress
  pointsNewCoords: ICollectionOfSelectedPointsData
}>

export type IDataOfPointsToDelete = Array<{
  propAddress: PropAddress
  pointsIndices: number[]
}>
