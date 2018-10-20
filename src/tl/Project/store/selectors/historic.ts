import pointerFriendlySelector from '$shared/utils/redux/pointerFriendlySelector'
import {TimelineAddress, ObjectAddress, PropAddress} from '$tl/handy/addresses'
import {
  ProjectHistoricState,
  TimelineTemplateState,
  ObjectTemplateState,
} from '../types'
import {val} from '$shared/DataVerse2/atom'

export const getTimelineTemplateState = pointerFriendlySelector(
  (
    s: ProjectHistoricState,
    addr: TimelineAddress,
  ): undefined | TimelineTemplateState => {
    return s.timelineTemplates[addr.timelinePath]
  },
)

export const getObjectState = pointerFriendlySelector(
  (
    s: ProjectHistoricState,
    addr: ObjectAddress,
  ): undefined | ObjectTemplateState => {
    const possibleTimelineTemplate = getTimelineTemplateState(s, addr)

    return (
      possibleTimelineTemplate &&
      possibleTimelineTemplate.objects[addr.objectPath]
    )
  },
)

export const getPropState = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: PropAddress) => {
    const possibleObjectState = getObjectState(s, addr)
    return possibleObjectState && possibleObjectState.props[addr.propKey]
  },
)

export const getTimelineDuration = pointerFriendlySelector(
  (s: ProjectHistoricState, addr: TimelineAddress): number => {
    const savedDuration = val(s.timelineTemplates[addr.timelinePath].duration)

    return typeof savedDuration === 'number' ? savedDuration : 2000
  },
)
