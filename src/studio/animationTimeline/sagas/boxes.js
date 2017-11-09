// @flow
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'
import {type TimelineID, type BoxID} from '$studio/animationTimeline/types'

export function* moveBox(
  timelineId: TimelineID,
  fromIndex: number,
  toIndex: number,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'timelines', 'byId', timelineId, 'layout'],
    layout => {
      const newLayout = layout.slice()
      newLayout.splice(toIndex, 0, newLayout.splice(fromIndex, 1)[0])
      return newLayout
    },
  )
}

export function* mergeBoxes(
  timelineId: TimelineID,
  fromIndex: number,
  toIndex: number,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'timelines', 'byId', timelineId],
    ({layout, boxes}) => {
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
    },
  )
}

export function* resizeBox(
  timelineId: TimelineID,
  boxId: BoxID,
  newSize: number,
): Generator<*, void, *> {
  yield reduceState(
    [
      'animationTimeline',
      'timelines',
      'byId',
      timelineId,
      'boxes',
      boxId,
      'height',
    ],
    () => newSize,
  )
}

export function* splitLane(
  timelineId: TimelineID,
  fromIndex: number,
  laneId: string,
): Generator<*, void, *> {
  yield reduceState(
    ['animationTimeline', 'timelines', 'byId', timelineId],
    ({layout, boxes}) => {
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
    },
  )
}
