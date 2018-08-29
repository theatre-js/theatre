import reducto from '$shared/utils/redux/reducto'
import {
  $ProjectHistoricState,
  IBezierCurvesOfScalarValues,
  ProjectHistoricState,
  StaticValueContainer,
} from '$tl/Project/store/types'
import {PropAddress, ObjectAddress, TimelineAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {
  TPointCoords,
  TPointSingleHandle,
  TPoint,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TCollectionOfSelectedPointsData} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'

const r = reducto($ProjectHistoricState)

const ensureTimeline = (s: ProjectHistoricState, addr: TimelineAddress) => {
  if (!s.internalTimeines[addr.timelinePath]) {
    s.internalTimeines[addr.timelinePath] = {
      objects: {},
    }
  }
}

const ensureObject = (s: ProjectHistoricState, addr: ObjectAddress) => {
  ensureTimeline(s, addr)
  const timelineState = projectSelectors.historic.getInternalTimelineState(
    s,
    addr,
  )
  if (!timelineState.objects[addr.objectPath]) {
    timelineState.objects[addr.objectPath] = {props: {}}
  }
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

const getPoints = (
  s: ProjectHistoricState,
  addr: PropAddress,
): IBezierCurvesOfScalarValues['points'] => {
  const propState = projectSelectors.historic.getPropState(s, addr)
  const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
  return valueContainer.points
}

export const setPointsInBezierCurvesOfScalarValues = r(
  (s, p: PropAddress & {points: IBezierCurvesOfScalarValues['points']}) => {
    const propState = projectSelectors.historic.getPropState(s, p)
    const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
    valueContainer.points = p.points
  },
)

export const addPointInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddress & {pointProps: TPoint}) => {
    const points = getPoints(s, p.propAddress)
    let atIndex = points.findIndex(point => point.time > p.pointProps.time)
    if (atIndex === -1) atIndex = points.length
    points.splice(atIndex, 0, p.pointProps)
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
  (s, p: TPropAddressWithPointIndex & {newCoords: TPointCoords}) => {
    const point = getPoints(s, p.propAddress)[p.pointIndex]
    point.time = p.newCoords.time
    point.value = p.newCoords.value
  },
)

export const movePointLeftHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex & {newHandle: TPointSingleHandle}) => {
    const points = getPoints(s, p.propAddress)
    const prevPointHandles =
      points[p.pointIndex - 1].interpolationDescriptor.handles
    prevPointHandles[2] = p.newHandle[0]
    prevPointHandles[3] = p.newHandle[1]
  },
)

export const movePointRightHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPropAddressWithPointIndex & {newHandle: TPointSingleHandle}) => {
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
    p: Array<TPropAddress & {pointsNewCoords: TCollectionOfSelectedPointsData}>,
  ) => {
    p.forEach(({propAddress, pointsNewCoords}) => {
      const points = getPoints(s, propAddress)
      Object.entries(pointsNewCoords).forEach(([pointIndex, newCoords]) => {
        const point = points[Number(pointIndex)]
        point.time = newCoords.time
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
  (s, p: TPropAddressWithPointIndex & {newCoords: TPointCoords}) => {
    const points = getPoints(s, p.propAddress)
    const pointToUpdate = points[p.pointIndex]
    const nextPoint = points[p.pointIndex + 1]
    const prevPoint = points[p.pointIndex - 1]
    const nextPointTime = (nextPoint && nextPoint.time) || Infinity
    const prevPointTime = (prevPoint && prevPoint.time) || -Infinity
    const {time: newTime, value: newValue} = p.newCoords

    if (newTime > prevPointTime && newTime < nextPointTime) {
      pointToUpdate.time = newTime
      pointToUpdate.value = newValue
      return
    }

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
    const objectState = projectSelectors.historic.getObjectState(s, p)
    if (!objectState.props[p.propKey]) {
      objectState.props[p.propKey] = {
        valueContainer: {
          type: 'StaticValueContainer',
          value: p.value,
        },
      }
    } else {
      ;(objectState.props[p.propKey]
        .valueContainer as StaticValueContainer).value =
        p.value
    }
  },
)

export const prop_convertPropToBezierCurves = r((s, p: PropAddress) => {
  ensureObject(s, p)
  const objectState = projectSelectors.historic.getObjectState(s, p)
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
  const objectState = projectSelectors.historic.getObjectState(s, p)
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
        handles: [0.2, 0.2, 0.2, 0.2],
      },
    },
  ],
})
