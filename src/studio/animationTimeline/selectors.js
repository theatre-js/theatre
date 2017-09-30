// @flow
import {type Selector} from '$studio/types'

export const getTimelineById: Selector<$FlowFixMe, $FlowFixMe> = (state, id) => (
  state.animationTimeline.timelines.byId[id]
)

export const getLanesByIds: Selector<$FlowFixMe, $FlowFixMe> = (state, ids) => (
  ids.map((id) => state.animationTimeline.lanes.byId[id])
)