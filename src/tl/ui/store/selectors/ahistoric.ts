import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {UIAhistoricState} from '../types'
import {TimelineAddress, ObjectAddress, PropAddress} from '$tl/handy/addresses'
import {val} from '$shared/DataVerse2/atom'

export const getTimelineState = pointerFriendlySelector(
  (s: UIAhistoricState, addr: TimelineAddress) => {
    return s.allInOnePanel.projects[addr.projectId].timelines[addr.timelinePath]
  },
)

export const getObjectState = pointerFriendlySelector(
  (s: UIAhistoricState, addr: ObjectAddress) => {
    return getTimelineState(s, addr).objects[addr.objectPath]
  },
)

export const getPropState = pointerFriendlySelector(
  (s: UIAhistoricState, addr: PropAddress) => {
    return getObjectState(s, addr).props[addr.propKey]
  },
)

export const getRangeShownInPanel = pointerFriendlySelector(
  (s: UIAhistoricState, addr: TimelineAddress) => {
    return (
      val(getTimelineState(s, addr).rangeShownInPanel) || {from: 0, to: 2000}
    )
  },
)
