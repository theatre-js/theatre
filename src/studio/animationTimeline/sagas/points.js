// @flow
import {reduceState} from '$shared/utils'
import {
  type LaneID,
  type Point,
  type PointPosition,
  type PointHandles,
} from '$studio/animationTimeline/types'

export function* addPointToLane(laneId: LaneID, newPoint: Point): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], points => {
    let atIndex = points.findIndex(point => point.t > newPoint.t)
    if (atIndex === -1) atIndex = points.length
    return points.slice(0, atIndex).concat(newPoint, points.slice(atIndex))
  })
  yield* resetExtremums(laneId)
}

export function* removePointFromLane(
  laneId: LaneID,
  atIndex: number,
): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId, 'points'], points =>
    points.slice(0, atIndex).concat(points.slice(atIndex + 1)),
  )
  yield* resetExtremums(laneId)
}

export function* setPointPositionTo(
  laneId: LaneID,
  atIndex: number,
  newPosition: PointPosition,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex],
    point => ({
      ...point,
      ...newPosition,
    }),
  )
  yield* resetExtremums(laneId)
}

export function* changePointPositionBy(
  laneId: LaneID,
  atIndex: number,
  change: PointPosition,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex],
    point => ({
      ...point,
      t: point.t + change.t,
      value: point.value + change.value,
    }),
  )
  yield* resetExtremums(laneId)
}

export function* addConnector(laneId: LaneID, atIndex: number): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex],
    point => ({
      ...point,
      isConnected: true,
    }),
  )
}

export function* removeConnector(laneId: LaneID, atIndex: number): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex],
    point => ({
      ...point,
      isConnected: false,
    }),
  )
}

export function* changePointHandlesBy(
  laneId: LaneID,
  atIndex: number,
  change: PointHandles,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex, 'handles'],
    handles => {
      return handles.map((handle, index) => handle + change[index])
    },
  )
  yield* resetExtremums(laneId)
}

export function* makeHandleHorizontal(
  laneId: LaneID,
  atIndex: number,
  side: 'right' | 'left',
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex, 'handles'],
    handles => {
      if (side === 'left') {
        handles[0] =
          Math.sign(handles[0]) *
          Math.sqrt(Math.pow(handles[0], 2) + Math.pow(handles[1], 2))
        handles[1] = 0
      }
      if (side === 'right') {
        handles[2] =
          Math.sign(handles[2]) *
          Math.sqrt(Math.pow(handles[2], 2) + Math.pow(handles[3], 2))
        handles[3] = 0
      }
      return handles
    },
  )
  yield* resetExtremums(laneId)
}

export function* makeHandlesParallel(
  laneId: LaneID,
  atIndex: number,
  side: 'right' | 'left',
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex, 'handles'],
    handles => {
      if (side === 'left') {
        const theta = Math.atan2(handles[3], handles[2]) + Math.PI
        const length = Math.sqrt(Math.pow(handles[0], 2) + Math.pow(handles[1], 2))
        handles[0] = length * Math.cos(theta)
        handles[1] = length * Math.sin(theta)
      }
      if (side === 'right') {
        const theta = Math.atan2(handles[1], handles[0]) + Math.PI
        const length = Math.sqrt(Math.pow(handles[2], 2) + Math.pow(handles[3], 2))
        handles[2] = length * Math.cos(theta)
        handles[3] = length * Math.sin(theta)
      }
      return handles
    },
  )
  yield* resetExtremums(laneId)
}

export function* makeHandlesEqual(
  laneId: LaneID,
  atIndex: number,
  side: 'right' | 'left',
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'lanes', 'byId', laneId, 'points', atIndex, 'handles'],
    handles => {
      if (side === 'left') {
        handles[0] = -handles[2]
        handles[1] = -handles[3]
      }
      if (side === 'right') {
        handles[2] = -handles[0]
        handles[3] = -handles[1]
      }
      return handles
    },
  )
  yield* resetExtremums(laneId)
}

function* resetExtremums(laneId: LaneID): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'lanes', 'byId', laneId], lane => {
    const {points} = lane
    if (points.length === 0) return lane
    const newExtremums = points.reduce(
      (reducer, point) => {
        const {value, handles} = point
        return [
          Math.min(
            reducer[0],
            Math.min(value, value + handles[1], value + handles[3]) - 10,
          ),
          Math.max(
            reducer[1],
            Math.max(value, value + handles[1], value + handles[3]) + 10,
          ),
        ]
      },
      [0, 60],
    )
    return {
      ...lane,
      extremums: newExtremums,
    }
  })
}
