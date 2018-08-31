import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {TimelineAddress, ObjectAddress, PropAddress} from '$tl/handy/addresses'
import {
  ProjectHistoricState,
  InternalTimelineState,
  InternalObjectState,
} from '../types'

const getInternalTimelineState = pointerFriendlySelector(
  (
    s: ProjectHistoricState,
    addr: TimelineAddress,
  ): undefined | InternalTimelineState => {
    return s.internalTimeines[addr.timelinePath]
  },
)

const getObjectState = pointerFriendlySelector(
  (
    s: ProjectHistoricState,
    addr: ObjectAddress,
  ): undefined | InternalObjectState => {
    const possibleInternalTimeline = getInternalTimelineState(s, addr)

    return (
      possibleInternalTimeline &&
      possibleInternalTimeline.objects[addr.objectPath]
    )
  },
)

const getPropState = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: PropAddress) => {
    const possibleObjectState = getObjectState(s, addr);
    return possibleObjectState && possibleObjectState.props[addr.propKey]
  },
)

const projectHistoricSelectors = {
  getInternalTimelineState,
  getObjectState,
  getPropState,
}

export default projectHistoricSelectors
