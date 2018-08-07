import memoizeOne from 'memoize-one'
import {
  BoxesObject,
  LayoutArray,
  Variables,
} from '$theater/AnimationTimelinePanel/types'
import {svgPaddingY} from '$theater/AnimationTimelinePanel/variables/GraphsSvgWrapper'
import {
  TSelectedPoints,
  TBoxesBoundaries,
  TDims,
  TTransformedSelectedArea,
  THorizontalLimits,
} from '$theater/AnimationTimelinePanel/selection/types'
import {MIN_BOX_HEIGHT} from '$theater/AnimationTimelinePanel/boxes/BoxWrapper'
import {uniq} from 'lodash'
import {POINT_RECT_EDGE_SIZE} from '$theater/AnimationTimelinePanel/views/point/PointClickArea'

export const memoizedGetBoxesBoundaries = memoizeOne(
  (boxes: BoxesObject, layout: LayoutArray): TBoxesBoundaries => {
    let currentEdge = 0
    return layout.reduce(
      (boundaries, value) => {
        const box = boxes[value]
        let boundariesToAdd: [number, number]
        let boxHeight: number
        if (box.dopeSheet) {
          boxHeight = box.variables.length * MIN_BOX_HEIGHT
          boundariesToAdd = [currentEdge, currentEdge + boxHeight]
        } else {
          boxHeight = box.height
          boundariesToAdd = [
            currentEdge + svgPaddingY / 2,
            currentEdge + boxHeight - svgPaddingY / 2,
          ]
        }
        currentEdge += boxHeight
        return boundaries.concat(boundariesToAdd)
      },
      [] as number[],
    )
  },
)

export const getTransformedSelectedArea = (
  dims: TDims,
  focus: [number, number],
  duration: number,
  boxWidth: number,
  boxesBoundaries: TBoxesBoundaries,
  offsetTop: number,
): TTransformedSelectedArea => {
  const fromX = dims.left
  const fromY = dims.top + offsetTop
  const dX = dims.width
  const dY = dims.height

  const fromIndex = boxesBoundaries.findIndex((b: number) => b > fromY) - 1
  let toIndex = boxesBoundaries.findIndex((b: number) => b >= fromY + dY)
  if (toIndex === -1) toIndex = boxesBoundaries.length - 1

  const topBoundaryBoxIndex =
    fromIndex % 2 === 0 ? fromIndex / 2 : Math.ceil(fromIndex / 2)
  const bottomBoundaryBoxIndex =
    toIndex % 2 === 0 ? toIndex / 2 : Math.floor(toIndex / 2)

  const leftOffset = focus[0] / duration
  const focusedWidth = (focus[1] - focus[0]) / duration
  const left = 100 * (leftOffset + focusedWidth * (fromX / boxWidth))
  const right = 100 * (leftOffset + focusedWidth * ((fromX + dX) / boxWidth))

  let transformedBoundaries
  if (topBoundaryBoxIndex === bottomBoundaryBoxIndex) {
    const topBoundary = boxesBoundaries[topBoundaryBoxIndex * 2]
    const bottomBoundary = boxesBoundaries[bottomBoundaryBoxIndex * 2 + 1]
    const boxHeight = bottomBoundary - topBoundary
    transformedBoundaries = {
      [topBoundaryBoxIndex]: {
        left,
        right,
        top: ((fromY - topBoundary) / boxHeight) * 100,
        bottom: ((fromY + dY - topBoundary) / boxHeight) * 100,
      },
    }
  } else {
    const fromBoxTopBoundary = boxesBoundaries[topBoundaryBoxIndex * 2]
    const fromBoxHeight =
      boxesBoundaries[topBoundaryBoxIndex * 2 + 1] - fromBoxTopBoundary
    const toBoxTopBoundary = boxesBoundaries[bottomBoundaryBoxIndex * 2]
    const toBoxHeight =
      boxesBoundaries[bottomBoundaryBoxIndex * 2 + 1] - toBoxTopBoundary
    const fromBoxBoundaries = {
      left,
      right,
      top: (100 * (fromY - fromBoxTopBoundary)) / fromBoxHeight,
      bottom: 100,
    }
    const toBoxBoundaries = {
      left,
      right,
      top: 0,
      bottom: (100 * (fromY + dY - toBoxTopBoundary)) / toBoxHeight,
    }

    transformedBoundaries = {
      [topBoundaryBoxIndex]: fromBoxBoundaries,
      [bottomBoundaryBoxIndex]: toBoxBoundaries,
      ...Array.from(
        Array(bottomBoundaryBoxIndex - topBoundaryBoxIndex - 1),
        (_, i: number) => i + topBoundaryBoxIndex + 1,
      ).reduce((reducer: Object, n: number) => {
        return {
          ...reducer,
          [n]: {
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
  focus: [number, number],
  duration: number,
  boxWidth: number,
  offsetTop: number,
  boxesBoundaries: TBoxesBoundaries,
): TDims => {
  let arrayOfPointTimes: number[] = []
  Object.keys(selectedPoints).forEach((boxKey: string) => {
    const boxInfo = selectedPoints[boxKey]
    Object.keys(boxInfo).forEach((variableKey: string) => {
      const variableInfo = boxInfo[variableKey]
      Object.keys(variableInfo).forEach((pointKey: string) => {
        arrayOfPointTimes = [...arrayOfPointTimes, variableInfo[pointKey].time]
      })
    })
  })

  const leftOffset = (100 * focus[0]) / duration
  const focusedWidth = (focus[1] - focus[0]) / duration
  const left =
    -POINT_RECT_EDGE_SIZE / 2 +
    (((Math.min(...arrayOfPointTimes) - leftOffset) / focusedWidth) *
      boxWidth) /
      100
  const right =
    POINT_RECT_EDGE_SIZE / 2 +
    (((Math.max(...arrayOfPointTimes) - leftOffset) / focusedWidth) *
      boxWidth) /
      100

  const indicesOfBoxesInSelection = Object.keys(selectedPoints)
    .map(Number)
    .sort()
  const topBoundaryBoxIndex = indicesOfBoxesInSelection[0]
  const bottomBoundaryBoxIndex =
    indicesOfBoxesInSelection[indicesOfBoxesInSelection.length - 1]
  const topBoundaryBox = selectedPoints[topBoundaryBoxIndex]
  const bottomBoundaryBox = selectedPoints[bottomBoundaryBoxIndex]
  let arrayOfTopBoxValues: number[] = []
  let arrayOfBottomBoxValues: number[] = []
  Object.keys(topBoundaryBox).forEach((variableKey: string) => {
    const variableInfo = topBoundaryBox[variableKey]
    Object.keys(variableInfo).forEach((pointKey: string) => {
      arrayOfTopBoxValues = [
        ...arrayOfTopBoxValues,
        variableInfo[pointKey].value,
      ]
    })
  })
  Object.keys(bottomBoundaryBox).forEach((variableKey: string) => {
    const variableInfo = bottomBoundaryBox[variableKey]
    Object.keys(variableInfo).forEach((pointKey: string) => {
      arrayOfBottomBoxValues = [
        ...arrayOfBottomBoxValues,
        variableInfo[pointKey].value,
      ]
    })
  })

  const top =
    boxesBoundaries[topBoundaryBoxIndex * 2] +
    (Math.min(...arrayOfTopBoxValues) / 100) *
      (boxesBoundaries[topBoundaryBoxIndex * 2 + 1] -
        boxesBoundaries[topBoundaryBoxIndex * 2]) -
    offsetTop -
    POINT_RECT_EDGE_SIZE / 2

  const bottom =
    boxesBoundaries[bottomBoundaryBoxIndex * 2] +
    (Math.max(...arrayOfBottomBoxValues) / 100) *
      (boxesBoundaries[bottomBoundaryBoxIndex * 2 + 1] -
        boxesBoundaries[bottomBoundaryBoxIndex * 2]) -
    offsetTop +
    POINT_RECT_EDGE_SIZE / 2

  return {left, top, width: right - left, height: bottom - top}
}

export const getHorizontalLimits = (
  selectedPoints: TSelectedPoints,
  focus: [number, number],
  boxWidth: number,
  variables: Variables,
): THorizontalLimits => {
  let leftLimit = -Infinity
  let rightLimit = Infinity
  Object.keys(selectedPoints).forEach((boxKey: string) => {
    const selectedBox = selectedPoints[boxKey]
    Object.keys(selectedBox).forEach((variableKey: string) => {
      const {points: variablePoints} = variables[variableKey]
      const selectedPointsKeys = Object.keys(selectedBox[variableKey]).map(
        Number,
      )
      selectedPointsKeys.forEach((pointIndex: number) => {
        const point = variablePoints[pointIndex]
        const prevIndex = pointIndex - 1
        const nextIndex = pointIndex + 1

        if (!selectedPointsKeys.includes(prevIndex)) {
          const prevPoint = variablePoints[prevIndex]
          if (prevPoint != null) {
            leftLimit = Math.max(leftLimit, prevPoint.time - point.time)
          } else {
            leftLimit = Math.max(leftLimit, -point.time)
          }
        }
        if (!selectedPointsKeys.includes(nextIndex)) {
          const nextPoint = variablePoints[nextIndex]
          if (nextPoint != null) {
            rightLimit = Math.min(rightLimit, nextPoint.time - point.time)
          } else {
            rightLimit = Math.min(rightLimit, focus[1] - point.time)
          }
        }
      })
    })
  })
  return {
    left: (leftLimit / (focus[1] - focus[0])) * boxWidth,
    right: (rightLimit / (focus[1] - focus[0])) * boxWidth,
  }
}
