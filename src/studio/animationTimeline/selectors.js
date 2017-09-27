// @flow
import {type Selector} from '$studio/types'

export const getTimelineById: Selector<$FlowFixMe, $FlowFixMe> = (state, id) => (
  state.animationTimeline.timelines.byId[id]
  // const boxes = Object.keys(timeline.boxes).reduce((obj, key) => {
  //   const lanes = timeline.boxes[key].lanes.map((id) => state.animationTimeline.lanes.byId[id])
  //   return {...obj, [key]: {...timeline.boxes[key], lanes}}
  // }, {})
  
  // return {
  //   ...timeline,
  //   boxes,
  // }
)

export const getLanesByIds: Selector<$FlowFixMe, $FlowFixMe> = (state, ids) => (
  ids.map((id) => state.animationTimeline.lanes.byId[id])
)