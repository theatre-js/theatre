// @flow
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'

export function* addPointToLane(laneId: $FlowFixMe, t: number, value: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], (points) => {
    let atIndex = points.findIndex((point) => point.t > t)
    if (atIndex === -1) atIndex = points.length
    const point = {
      id: generateUniqueId(),
      t, value,
      isConnected: false,
      handles: [-25, 0, 25, 0],
    }
    return points.slice(0, atIndex).concat(point, points.slice(atIndex))
  })
}

export function* removePointFromLane(laneId: $FlowFixMe, atIndex: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], (points) => (
    points.slice(0, atIndex).concat(points.slice(atIndex + 1))
  ))
}

export function* updatePointProps(laneId: $FlowFixMe, atIndex: number, newProps: Object): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex], (point) => ({
    ...point,
    ...newProps,  
  }))
}