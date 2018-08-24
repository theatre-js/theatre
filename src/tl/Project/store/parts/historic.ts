import reducto from '$shared/utils/redux/reducto'
import {
  $ProjectHistoricState,
  IBezierCurvesOfScalarValues,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import {PropAddress, ObjectAddress, TimelineAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {TPointCoords} from '$tl/ui/panels/AllInOnePanel/Right/types'

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

export const setPointsInBezierCurvesOfScalarValues = r(
  (s, p: PropAddress & {points: IBezierCurvesOfScalarValues['points']}) => {
    const propState = projectSelectors.historic.getPropState(s, p)
    const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
    valueContainer.points = p.points
  },
)

export const setPointCoordsInBezierCurvesOfScalarValues = r(
  (
    s,
    p: {propAddress: PropAddress; coords: TPointCoords; pointIndex: number},
  ) => {
    const propState = projectSelectors.historic.getPropState(s, p.propAddress)
    const valueContainer = propState.valueContainer as IBezierCurvesOfScalarValues
    const points = valueContainer.points
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
