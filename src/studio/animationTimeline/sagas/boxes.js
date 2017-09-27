// @flow
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'

export function* moveBox(timelineId: $FlowFixMe, fromIndex: number, toIndex: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'timelines', 'byId', timelineId, 'layout'], (layout) => {
    const newLayout = layout.slice()
    newLayout.splice(toIndex, 0, newLayout.splice(fromIndex, 1)[0])
    return newLayout
  })
}

export function* mergeBoxes(timelineId: $FlowFixMe, fromIndex: number, toIndex: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'timelines', 'byId', timelineId], ({layout, boxes}) => {
    const fromId = layout[fromIndex]
    const toId = layout[toIndex]
    
    const newLayout = layout.slice()
    newLayout.splice(fromIndex, 1)
    
    const {[fromId]: mergedBox, ...newBoxes} = boxes
    newBoxes[toId].lanes = newBoxes[toId].lanes.concat(mergedBox.lanes)

    return {
      layout: newLayout,
      boxes: newBoxes,
    }
  })
}

export function* resizeBox(timelineId: $FlowFixMe, boxId: $FlowFixMe, newSize: number): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'timelines', 'byId', timelineId, 'boxes', boxId, 'height'], () => newSize)
}

export function* splitLane(timelineId: $FlowFixMe, fromIndex: number, laneId: string): Generator<*, void, *> {
  yield reduceState(['animationTimeline', 'timelines', 'byId', timelineId], ({layout, boxes}) => {
    const fromId = layout[fromIndex]
    const newBoxId = generateUniqueId()

    const fromBox = boxes[fromId]
    const newLanes = fromBox.lanes.slice()
    newLanes.splice(newLanes.indexOf(laneId), 1)

    const newBoxes = {
      ...boxes,
      [fromId]: {
        ...fromBox,
        lanes: newLanes,
      },
      [newBoxId]: {
        id: newBoxId,
        height: fromBox.height,
        lanes: [laneId],
      },
    }

    const newLayout = layout.slice()
    newLayout.splice(fromIndex + 1, 0, newBoxId)

    return {
      layout: newLayout,
      boxes: newBoxes,
    }
  })
}