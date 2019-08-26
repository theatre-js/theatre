import reducto from '$shared/utils/redux/reducto'
import {original as immerToOriginal} from 'immer'
// import
import {
  $ProjectHistoricState,
  IBezierCurvesOfScalarValues,
  ProjectHistoricState,
  StaticValueContainer,
} from '$tl/Project/store/types'
import {PropAddress, ObjectAddress, TimelineAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {
  IPointCoords,
  IPointSingleHandle,
  IPoint,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {ICollectionOfSelectedPointsData} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {roundTimeToClosestFrame} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'

const r = reducto($ProjectHistoricState)

const ensureTimeline = (s: ProjectHistoricState, addr: TimelineAddress) => {
  if (!s.timelineTemplates[addr.timelinePath]) {
    s.timelineTemplates[addr.timelinePath] = {
      objects: {},
      duration: null,
    }
  }
  return s.timelineTemplates[addr.timelinePath]
}

const ensureObject = (s: ProjectHistoricState, addr: ObjectAddress) => {
  const timelineState = ensureTimeline(s, addr)
  if (!timelineState.objects[addr.objectPath]) {
    timelineState.objects[addr.objectPath] = {props: {}}
  }
  return timelineState.objects[addr.objectPath]
}

// const ensurePropWithValueContainer = (
//   s: ProjectHistoricState,
//   addr: PropAddress
// ) => {
//   ensureObject(s, addr)
//   const objectState = projectSelectors.historic.getObjectState(s, addr)
//   if (!objectState.props[addr.propKey]) {
//     objectState.props[addr.propKey] = {valueContainer}
//   }
// }

type TPropAddress = {propAddress: PropAddress}
type TPropAddressWithPointIndex = TPropAddress & {pointIndex: number}

export const setTimelineDuration = r(
  (s, p: TimelineAddress & {duration: number}) => {
    ensureTimeline(s, p).duration = p.duration
  },
)

const getPoints = (
  s: ProjectHistoricState,
  addr: PropAddress,
): IBezierCurvesOfScalarValues['points'] => {
  const propState = projectSelectors.historic.getPropState(s, addr)!
  const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
  return valueContainer.points
}

export const setPointsInBezierCurvesOfScalarValues = r(
  (s, p: PropAddress & {points: IBezierCurvesOfScalarValues['points']}) => {
    const propState = projectSelectors.historic.getPropState(s, p)!
    const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
    valueContainer.points = p.points
  },
)

export const addPointInBezierCurvesOfScalarValues = r(
  (
    s,
    p: TPropAddress & {pointProps: IPoint; recalculateInterpolator?: boolean},
  ) => {
    const points = getPoints(s, p.propAddress)
    let atIndex = points.findIndex(point => point.time > p.pointProps.time)
    if (atIndex === -1) atIndex = points.length
    const newPoint: IPoint = {...p.pointProps}
    if (p.recalculateInterpolator) {
      const leftPoint = points[atIndex - 1]
      if (leftPoint && leftPoint.interpolationDescriptor.connected) {
        const leftInterpolator = immerToOriginal(
          leftPoint.interpolationDescriptor,
        ) as IPoint['interpolationDescriptor']
        const thisInterpolator = {...leftInterpolator}
        if (thisInterpolator.interpolationType === 'CubicBezier') {
          thisInterpolator.handles = [...thisInterpolator.handles] as [
            number,
            number,
            number,
            number
          ]
          thisInterpolator.handles[0] = 0.5
          thisInterpolator.handles[1] = 0.5
          leftPoint.interpolationDescriptor.handles[2] = 0.5
          leftPoint.interpolationDescriptor.handles[3] = 0.5
        }
        newPoint.interpolationDescriptor = thisInterpolator
      }
    }
    points.splice(atIndex, 0, newPoint)
  },
)

export const addConnectorInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    if (p.pointIndex === points.length - 1) return
    points[p.pointIndex].interpolationDescriptor.connected = true
  },
)

export const removeConnectorInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex].interpolationDescriptor.connected = false
  },
)

export const removePointInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    if (points[p.pointIndex - 1] != null && points[p.pointIndex + 1] == null) {
      points[p.pointIndex - 1].interpolationDescriptor.connected = false
    }
    points.splice(p.pointIndex, 1)
  },
)

export const movePointToNewCoordsInBezierCurvesOfScalarValues = r(
  (
    s,
    p: TPropAddressWithPointIndex & {
      newCoords: IPointCoords
      snapToFrameSize?: number
    },
  ) => {
    const point = getPoints(s, p.propAddress)[p.pointIndex]

    point.time =
      typeof p.snapToFrameSize === 'number'
        ? roundTimeToClosestFrame(p.newCoords.time, p.snapToFrameSize)
        : p.newCoords.time
    point.value = p.newCoords.value
  },
)

export const movePointLeftHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex & {newHandle: IPointSingleHandle}) => {
    const points = getPoints(s, p.propAddress)
    const prevPointHandles =
      points[p.pointIndex - 1].interpolationDescriptor.handles
    prevPointHandles[2] = p.newHandle[0]
    prevPointHandles[3] = p.newHandle[1]
  },
)

export const movePointRightHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex & {newHandle: IPointSingleHandle}) => {
    const points = getPoints(s, p.propAddress)
    const pointHandles = points[p.pointIndex].interpolationDescriptor.handles
    pointHandles[0] = p.newHandle[0]
    pointHandles[1] = p.newHandle[1]
  },
)

export const makePointLeftHandleHorizontalInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex - 1].interpolationDescriptor.handles[3] = 0
  },
)

export const makePointRightHandleHorizontalInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex].interpolationDescriptor.handles[1] = 0
  },
)

export const resetPointHandlesInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex].interpolationDescriptor.handles = [0.5, 0.0, 0.5, 0.0]
  },
)

export const moveDopesheetConnectorInBezierCurvesOfScalarValues = r(
  (
    s,
    p: TPropAddress & {
      leftPoint: {index: number; newTime: number}
      rightPoint: {index: number; newTime: number}
    },
  ) => {
    const points = getPoints(s, p.propAddress)
    points[p.leftPoint.index].time = p.leftPoint.newTime
    points[p.rightPoint.index].time = p.rightPoint.newTime
  },
)

export const moveSelectionOfPointsInBezierCurvesOfScalarValues = r(
  (
    s,
    p: {
      points: Array<
        TPropAddress & {pointsNewCoords: ICollectionOfSelectedPointsData}
      >
      snapToFrameSize?: number
    },
  ) => {
    p.points.forEach(({propAddress, pointsNewCoords}) => {
      const points = getPoints(s, propAddress)
      Object.entries(pointsNewCoords).forEach(([pointIndex, newCoords]) => {
        const point = points[Number(pointIndex)]
        point.time =
          typeof p.snapToFrameSize === 'number'
            ? roundTimeToClosestFrame(newCoords.time, p.snapToFrameSize)
            : newCoords.time
        if (newCoords.value != null) point.value = newCoords.value
      })
    })
  },
)

export const removeSelectionOfPointsInBezierCurvesOfScalarValues = r(
  (s, p: Array<TPropAddress & {pointsIndices: number[]}>) => {
    p.forEach(({propAddress, pointsIndices}) => {
      const points = getPoints(s, propAddress)
      pointsIndices.forEach((pointIndex, i) => {
        pointIndex -= i
        if (points[pointIndex - 1] != null && points[pointIndex + 1] == null) {
          points[pointIndex - 1].interpolationDescriptor.connected = false
        }
        points.splice(pointIndex, 1)
      })
    })
  },
)

export const setPointCoordsInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex & {newCoords: IPointCoords}) => {
    const points = getPoints(s, p.propAddress)
    const pointToUpdate = points[p.pointIndex]
    const nextPoint = points[p.pointIndex + 1]
    const prevPoint = points[p.pointIndex - 1]
    const nextPointTime = (nextPoint && nextPoint.time) || Infinity
    const prevPointTime = (prevPoint && prevPoint.time) || -Infinity
    const {time: newTime, value: newValue} = p.newCoords

    pointToUpdate.value = newValue
    if (newTime > prevPointTime && newTime < nextPointTime) {
      pointToUpdate.time = newTime
      return
    }

    pointToUpdate.value = newValue

    // If trying to move the point behind prev point
    if (newTime <= prevPointTime) {
      // if there is no prev point, then 0 is the minimum
      if (prevPointTime === -Infinity) {
        pointToUpdate.time = 0
        return
      } else {
        // if there is no next point, then put it a millisecond after prev point
        if (nextPointTime === Infinity) {
          pointToUpdate.time = prevPointTime + 1
          // if there is a next point
        } else {
          // if the prev and next are more than a millisecond apart
          if (nextPointTime - prevPointTime > 1) {
            // put the new point 1ms after prev point
            pointToUpdate.time = prevPointTime + 1
          } else {
            // can't do anything
            return
          }
        }
      }
    } else if (newTime >= nextPointTime) {
      // if there is no next point
      if (nextPointTime === Infinity) {
        // don't set the time
        return
      } else {
        // if there is no prev point
        if (prevPointTime === -Infinity) {
          // put it 1ms before next point
          pointToUpdate.time = nextPointTime - 1
        } else {
          // if the prev and next are more than a millisecond apart
          if (nextPointTime - prevPointTime > 1) {
            // put the new point 1ms before next point
            pointToUpdate.time = nextPointTime - 1
          } else {
            // can't do anything
            return
          }
        }
      }
    }

    return

    if (newTime === prevPointTime || newTime === nextPointTime) return

    points.splice(p.pointIndex, 1)
    let newIndex = points.findIndex(point => point.time >= newTime)
    if (newIndex !== -1 && newTime === points[newIndex].time) {
      points.splice(p.pointIndex, 0, pointToUpdate)
      return
    }

    if (newTime > nextPointTime) {
      if (newIndex === -1) {
        newIndex = points.length
        pointToUpdate.interpolationDescriptor.connected = false
      }
    }
    if (newTime < prevPointTime) {
      if (p.pointIndex === points.length) {
        prevPoint.interpolationDescriptor.connected = false
      }
    }

    pointToUpdate.time = newTime
    pointToUpdate.value = newValue
    points.splice(newIndex, 0, pointToUpdate)
  },
)

export const prop_setNumberValueInStaticValueContainer = r(
  (s, p: PropAddress & {value: number}) => {
    ensureObject(s, p)
    const objectState = projectSelectors.historic.getObjectState(s, p)!
    if (!objectState.props[p.propKey]) {
      objectState.props[p.propKey] = {
        valueContainer: {
          type: 'StaticValueContainer',
          value: p.value,
        },
      }
    } else {
      ;(objectState.props[p.propKey]
        .valueContainer as StaticValueContainer).value = p.value
    }
  },
)

export const prop_convertPropToBezierCurves = r((s, p: PropAddress) => {
  ensureObject(s, p)
  const objectState = projectSelectors.historic.getObjectState(s, p)!
  const prop = objectState.props[p.propKey]
  if (!prop) {
    objectState.props[p.propKey] = {valueContainer: emptyTimeline(0)}
  } else if (prop.valueContainer.type === 'StaticValueContainer') {
    const oldValueConainer = prop.valueContainer as StaticValueContainer
    prop.valueContainer = emptyTimeline(oldValueConainer.value)
  }
})

export const prop_convertPropToStaticValue = r((s, p: PropAddress) => {
  ensureObject(s, p)
  const objectState = projectSelectors.historic.getObjectState(s, p)!
  const prop = objectState.props[p.propKey]
  if (!prop) {
    objectState.props[p.propKey] = {
      valueContainer: {type: 'StaticValueContainer', value: 0},
    }
  } else if (prop.valueContainer.type === 'BezierCurvesOfScalarValues') {
    const oldValueConainer = prop.valueContainer as IBezierCurvesOfScalarValues
    prop.valueContainer = {
      type: 'StaticValueContainer',
      value: oldValueConainer.points[0] ? oldValueConainer.points[0].value : 0,
    }
  }
})

const emptyTimeline = (value: number): IBezierCurvesOfScalarValues => ({
  type: 'BezierCurvesOfScalarValues',
  points: [
    {
      value,
      time: 0,
      interpolationDescriptor: {
        __descriptorType: 'TimelinePointInterpolationDescriptor',
        connected: false,
        interpolationType: 'CubicBezier',
        handles: [0.5, 0.0, 0.5, 0.0],
      },
    },
  ],
})
