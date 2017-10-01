// @flow
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'
import {type Point} from '$studio/animationTimeline/types'

export function* addPointToLane(laneId: $FlowFixMe, newPointProps: Point): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], (points) => {
    let atIndex = points.findIndex((point) => point.t > newPointProps.t)
    if (atIndex === -1) atIndex = points.length
    const point = {
      id: generateUniqueId(),
      ...newPointProps,
    }
    return points.slice(0, atIndex).concat(point, points.slice(atIndex))
  })
  yield * resetExtremums(laneId)
}

export function* removePointFromLane(laneId: $FlowFixMe, atIndex: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], (points) => (
    points.slice(0, atIndex).concat(points.slice(atIndex + 1))
  ))
  yield * resetExtremums(laneId)
}

export function* updatePointProps(laneId: $FlowFixMe, atIndex: number, newProps: Point): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex], (point) => ({
    ...point,
    ...newProps,  
  }))
  yield * resetExtremums(laneId)
}

export function* updatePointConnector(laneId: $FlowFixMe, atIndex: number, isConnected: boolean): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex], (point) => ({
    ...point,
    isConnected,
  }))
}

function* resetExtremums(laneId: $FlowFixMe): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId], (lane) => {
    const {points} = lane
    if (points.length === 0) return lane
    const newExtremums = points.reduce((reducer, point) => {
      const {value, handles} = point
      return [
        Math.min(reducer[0], Math.min(value, value + handles[1], value + handles[3]) - 10),
        Math.max(reducer[1], Math.max(value, value + handles[1], value + handles[3]) + 10),
      ]
    }, [0, 60])
    return {
      ...lane,
      extremums: newExtremums,
    }
  }) 
}