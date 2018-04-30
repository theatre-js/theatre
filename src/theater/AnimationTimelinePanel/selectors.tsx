import {Selector, ITheaterStoreState} from '$theater/types'
import {
  TimelineID,
  VariableID,
  TimelineObject,
  VariableObject,
} from '$theater/AnimationTimelinePanel/types'

export const getTimelineById: Selector<TimelineObject, TimelineID> = (
  state,
  id,
) => state.animationTimeline.timelines.byId[id]
