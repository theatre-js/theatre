// @flow
import {Selector, IStoreState} from '$studio/types'
import {
  TimelineID,
  VariableID,
  TimelineObject,
  VariableObject,
} from '$studio/animationTimeline/types'

export const getTimelineById: Selector<TimelineObject, TimelineID> = (
  state,
  id,
) => state.animationTimeline.timelines.byId[id]