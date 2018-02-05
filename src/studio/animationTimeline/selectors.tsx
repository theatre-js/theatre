// @flow
import {Selector} from '$studio/types'
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

export const getVariablesByIds: Selector<VariableObject[], VariableID[]> = (state, ids) =>
  ids.map(id => state.animationTimeline.variables.byId[id])
