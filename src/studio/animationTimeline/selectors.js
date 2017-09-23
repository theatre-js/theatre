// @flow
import {type Selector} from '$studio/types'

export const getTimelineById: Selector<$FlowFixMe, $FlowFixMe> = (state, id) => {
  const timeline = state.animationTimeline.timelines.byId[id]
  const boxes = Object.keys(timeline.boxes).reduce((obj, key) => {
    const lanes = timeline.boxes[key].lanes.map((id) => {
      const lane = state.animationTimeline.lanes.byId[id]
      const curves = lane.curves.map((id) => (state.animationTimeline.curves.byId[id]))
      return {...lane, curves}
    })
    return {...obj, [key]: {...timeline.boxes[key], lanes}}
  }, {})
  
  return {
    ...timeline,
    boxes,
  }
}