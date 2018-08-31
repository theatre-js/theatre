import memoizeOne from 'memoize-one'
import {
  TItemsInfo,
  TDims,
  TTransformedSelectedArea,
  TSelectedPoints,
  THorizontalLimits,
  TMapOfFilteredItemKeyToItemData,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {SVG_PADDING_Y} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'
import {TRange, TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {POINT_RECT_EDGE_SIZE} from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointClickArea'
import {
  getSvgXToPaddedSvgXOffset,
  getSvgWidth,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'

export const memoizedGetItemsInfo = memoizeOne(
  (mapOfItemsData: TMapOfFilteredItemKeyToItemData): TItemsInfo => {
    const itemsInfo = Object.entries(mapOfItemsData).reduce(
      (info, [itemKey, itemData]) => {
        let boundariesToAdd: [number, number]
        if (itemData.expanded) {
          boundariesToAdd = [
            itemData.top + SVG_PADDING_Y / 2,
            itemData.top + itemData.height - SVG_PADDING_Y / 2,
          ]
        } else {
          boundariesToAdd = [itemData.top, itemData.top + itemData.height]
        }
        return {
          boundaries: info.boundaries.concat(boundariesToAdd),
          keys: info.keys.concat(itemKey),
        }
      },
      {boundaries: [], keys: []} as TItemsInfo,
    )
    itemsInfo.boundaries.unshift(-Infinity)
    itemsInfo.boundaries.push(Infinity)
    return itemsInfo
  },
)

export const getTransformedSelectedArea = (
  dims: TDims,
  range: TRange,
  duration: TDuration,
  timelineWidth: number,
  itemsInfo: TItemsInfo,
): TTransformedSelectedArea => {
  const svgWidth = getSvgWidth(range, duration, timelineWidth)
  const getOffset = getSvgXToPaddedSvgXOffset(svgWidth)
  const fromX = dims.left - getOffset(dims.left)
  const fromY = dims.top
  const dY = dims.height
  const toX = dims.left + dims.width - getOffset(dims.left + dims.width)

  const {boundaries: itemsBoundaries, keys: itemsKeys} = itemsInfo
  const fromIndex = itemsBoundaries.findIndex(b => b > fromY)
  const toIndex = itemsBoundaries.findIndex(b => b > fromY + dY)

  if (toIndex % 2 === 1 && toIndex === fromIndex) return {}

  const upperBoundaryItemIndex =
    fromIndex % 2 === 0 ? fromIndex / 2 - 1 : Math.floor(fromIndex / 2)
  const lowerBoundaryItemIndex =
    toIndex % 2 === 0 ? toIndex / 2 - 1 : Math.floor(toIndex / 2) - 1

  const focusedWidth = (range.to - range.from) / duration
  const left = 100 * (focusedWidth * (fromX / timelineWidth))
  const right = 100 * (focusedWidth * (toX / timelineWidth))

  let transformedBoundaries
  if (upperBoundaryItemIndex === lowerBoundaryItemIndex) {
    const topBoundary = itemsBoundaries[upperBoundaryItemIndex * 2 + 1]
    const bottomBoundary = itemsBoundaries[lowerBoundaryItemIndex * 2 + 2]
    const itemHeight = bottomBoundary - topBoundary
    transformedBoundaries = {
      [itemsKeys[upperBoundaryItemIndex]]: {
        left,
        right,
        top: Math.max(0, ((fromY - topBoundary) / itemHeight) * 100),
        bottom: Math.min(100, ((fromY + dY - topBoundary) / itemHeight) * 100),
      },
    }
  } else {
    const firstItemInSelectionUpperBoundary =
      itemsBoundaries[upperBoundaryItemIndex * 2 + 1]
    const firstItemInSelectionHeight =
      itemsBoundaries[upperBoundaryItemIndex * 2 + 2] -
      firstItemInSelectionUpperBoundary
    const lastItemInSelectionUpperBoundary =
      itemsBoundaries[lowerBoundaryItemIndex * 2 + 1]
    const lastItemInSelectionHeight =
      itemsBoundaries[lowerBoundaryItemIndex * 2 + 2] -
      lastItemInSelectionUpperBoundary
    const firstItemInSelectionBoundaries = {
      left,
      right,
      top:
        (100 * (fromY - firstItemInSelectionUpperBoundary)) /
        firstItemInSelectionHeight,
      bottom: 100,
    }
    const lastItemInSelectionBoundaries = {
      left,
      right,
      top: 0,
      bottom:
        (100 * (fromY + dY - lastItemInSelectionUpperBoundary)) /
        lastItemInSelectionHeight,
    }

    transformedBoundaries = {
      [itemsKeys[upperBoundaryItemIndex]]: firstItemInSelectionBoundaries,
      [itemsKeys[lowerBoundaryItemIndex]]: lastItemInSelectionBoundaries,
      ...Array.from(
        Array(lowerBoundaryItemIndex - upperBoundaryItemIndex - 1),
        (_, i: number) => i + upperBoundaryItemIndex + 1,
      ).reduce((reducer: Object, n: number) => {
        return {
          ...reducer,
          [itemsKeys[n]]: {
            left,
            right,
            top: 0,
            bottom: 100,
          },
        }
      }, {}),
    }
  }

  return transformedBoundaries
}

export const getFittedDims = (
  selectedPoints: TSelectedPoints,
  range: TRange,
  duration: TDuration,
  timelineWidth: number,
  itemsInfo: TItemsInfo,
): TDims => {
  let arrayOfPointsTimes: number[] = []
  Object.values(selectedPoints).forEach(itemPoints => {
    Object.values(itemPoints).forEach(point => {
      arrayOfPointsTimes = [...arrayOfPointsTimes, point.time]
    })
  })

  const focusedWidth = (range.to - range.from) / duration
  const left =
    -POINT_RECT_EDGE_SIZE / 2 +
    ((Math.min(...arrayOfPointsTimes) / focusedWidth) * timelineWidth) / 100
  const right =
    POINT_RECT_EDGE_SIZE / 2 +
    ((Math.max(...arrayOfPointsTimes) / focusedWidth) * timelineWidth) / 100

  const {boundaries: itemsBoundaries, keys: itemsKeys} = itemsInfo
  const itemsInSelectionKeys = Object.keys(selectedPoints)
  const upperBoundaryItemIndex = itemsKeys.findIndex(key =>
    itemsInSelectionKeys.includes(key),
  )
  const lowerBoundaryItemIndex =
    itemsKeys.length -
    itemsKeys
      .slice()
      .reverse()
      .findIndex(key => itemsInSelectionKeys.includes(key)) -
    1

  let arrayOfUpperBoundaryItemValues: number[] = []
  let arrayOfLowerBoundaryItemValues: number[] = []

  Object.values(selectedPoints[itemsKeys[upperBoundaryItemIndex!]]).forEach(
    point => {
      arrayOfUpperBoundaryItemValues = [
        ...arrayOfUpperBoundaryItemValues,
        point.value,
      ]
    },
  )
  if (lowerBoundaryItemIndex === upperBoundaryItemIndex) {
    arrayOfLowerBoundaryItemValues = arrayOfUpperBoundaryItemValues
  } else {
    Object.values(selectedPoints[itemsKeys[lowerBoundaryItemIndex!]]).forEach(
      point => {
        arrayOfLowerBoundaryItemValues = [
          ...arrayOfLowerBoundaryItemValues,
          point.value,
        ]
      },
    )
  }

  const top =
    itemsBoundaries[upperBoundaryItemIndex * 2 + 1] +
    (Math.min(...arrayOfUpperBoundaryItemValues) / 100) *
      (itemsBoundaries[upperBoundaryItemIndex * 2 + 2] -
        itemsBoundaries[upperBoundaryItemIndex * 2 + 1]) -
    POINT_RECT_EDGE_SIZE / 2

  const bottom =
    itemsBoundaries[lowerBoundaryItemIndex * 2 + 1] +
    (Math.max(...arrayOfLowerBoundaryItemValues) / 100) *
      (itemsBoundaries[lowerBoundaryItemIndex * 2 + 2] -
        itemsBoundaries[lowerBoundaryItemIndex * 2 + 1]) +
    POINT_RECT_EDGE_SIZE / 2

  return {left, top, width: right - left, height: bottom - top}
}

export const getHorizontalLimits = (
  selectedPoints: TSelectedPoints,
  timelineWidth: number,
  range: TRange,
  mapOfItemsData: TMapOfFilteredItemKeyToItemData,
): THorizontalLimits => {
  let leftLimit = -Infinity
  let rightLimit = Infinity
  Object.keys(selectedPoints).forEach(itemKey => {
    const itemSelectedPoints = selectedPoints[itemKey]
    const allPointsOfItem = mapOfItemsData[itemKey].points
    const selectedPointsKeys = Object.keys(itemSelectedPoints).map(Number)

    selectedPointsKeys.forEach(pointIndex => {
      const point = allPointsOfItem[pointIndex]
      const prevIndex = pointIndex - 1
      const nextIndex = pointIndex + 1

      if (!selectedPointsKeys.includes(prevIndex)) {
        const prevPoint = allPointsOfItem[prevIndex]
        if (prevPoint != null) {
          leftLimit = Math.max(leftLimit, prevPoint.time - point.time)
        } else {
          leftLimit = Math.max(leftLimit, -point.time)
        }
      }
      if (!selectedPointsKeys.includes(nextIndex)) {
        const nextPoint = allPointsOfItem[nextIndex]
        if (nextPoint != null) {
          rightLimit = Math.min(rightLimit, nextPoint.time - point.time)
        } else {
          rightLimit = Math.min(rightLimit, range.to - point.time)
        }
      }
    })
  })
  const rangeDuration = range.to - range.from
  return {
    left: (leftLimit / rangeDuration) * timelineWidth,
    right: (rightLimit / rangeDuration) * timelineWidth,
  }
}
