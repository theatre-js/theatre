import reducto from '$shared/utils/redux/reducto'
import {
  $ProjectHistoricState,
  IBezierCurvesOfScalarValues,
  ProjectHistoricState,
} from '$tl/Project/store/types'
import {PropAddress, ObjectAddress, TimelineAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'

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
