import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {TimelineAddress, ObjectAddress, PropAddress} from '$tl/handy/addresses'
import {ProjectHistoricState} from '../types'

const getInternalTimelineState = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: TimelineAddress) => {
    return s.internalTimeines[addr.timelinePath]
  },
)

const getObjectState = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: ObjectAddress) => {
    return getInternalTimelineState(s, addr).objects[addr.objectPath]
  },
)

const getPropState = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: PropAddress) => {
    return getObjectState(s, addr).props[addr.propKey]
  },
)

const projectHistoricSelectors = {
  getInternalTimelineState,
  getObjectState,
  getPropState,
}

export default projectHistoricSelectors
