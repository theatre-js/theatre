import reducto from '$shared/utils/redux/reducto'
import {
  $ProjectHistoricState,
  IBezierCurvesOfScalarValues,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import {PropAddress, ObjectAddress, TimelineAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {
  TPointCoords,
  TPointSingleHandle,
} from '$tl/ui/panels/AllInOnePanel/Right/types'

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

// const ensureProp = (s: ProjectHistoricState, addr: PropAddress) => {
//   ensureObject(s, addr)
//   const objectState = projectSelectors.getObjectState(s, addr)
//   if (!objectState.props[addr.propKey]) {
//     objectState.props[addr.propKey] = {valueContainer: {
//       type: 'StaticValueContainer',
//       value
//     }}
//   }
// }

type TPointAddress = {propAddress: PropAddress; pointIndex: number}

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

export const addConnectorInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress) => {
    const points = getPoints(s, p.propAddress)
    if (p.pointIndex === points.length - 1) return
    points[p.pointIndex].interpolationDescriptor.connected = true
  },
)

export const removeConnectorInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex].interpolationDescriptor.connected = false
  },
)

export const removePointInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress) => {
    const points = getPoints(s, p.propAddress)
    if (points[p.pointIndex - 1] != null && points[p.pointIndex + 1] == null) {
      points[p.pointIndex - 1].interpolationDescriptor.connected = false
    }
    points.splice(p.pointIndex, 1)
  },
)

export const movePointToNewCoordsInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress & {newCoords: TPointCoords}) => {
    const point = getPoints(s, p.propAddress)[p.pointIndex]
    point.time = p.newCoords.time
    point.value = p.newCoords.value
  },
)

export const movePointLeftHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress & {newHandle: TPointSingleHandle}) => {
    const points = getPoints(s, p.propAddress)
    const prevPointHandles =
      points[p.pointIndex - 1].interpolationDescriptor.handles
    prevPointHandles[2] = p.newHandle[0]
    prevPointHandles[3] = p.newHandle[1]
  },
)

export const movePointRightHandleInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress & {newHandle: TPointSingleHandle}) => {
    const points = getPoints(s, p.propAddress)
    const pointHandles = points[p.pointIndex].interpolationDescriptor.handles
    pointHandles[0] = p.newHandle[0]
    pointHandles[1] = p.newHandle[1]
  },
)

export const makePointLeftHandleHorizontalInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex - 1].interpolationDescriptor.handles[3] = 0
  },
)

export const makePointRightHandleHorizontalInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress) => {
    const points = getPoints(s, p.propAddress)
    points[p.pointIndex].interpolationDescriptor.handles[1] = 0
  },
)

export const setPointCoordsInBezierCurvesOfScalarValues = r(
  (s, p: TPointAddress & {coords: TPointCoords}) => {
    const points = getPoints(s, p.propAddress)
    const pointToUpdate = points[p.pointIndex]
    const nextPoint = points[p.pointIndex + 1]
    const prevPoint = points[p.pointIndex - 1]
    const nextPointTime = (nextPoint && nextPoint.time) || Infinity
    const prevPointTime = (prevPoint && prevPoint.time) || -Infinity
    const {time: newTime, value: newValue} = p.coords

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
