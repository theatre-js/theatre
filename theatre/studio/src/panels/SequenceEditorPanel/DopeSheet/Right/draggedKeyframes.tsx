import {Box} from '@theatre/dataverse'
import type {KeyframeId} from '@theatre/shared/utils/ids'

export type IDraggedKeyframes = Set<KeyframeId>

export const draggedKeyframesB: Box<Set<KeyframeId>> = new Box(new Set())

export const draggedKeyframesUtils = {
  resetDraggedKeyframes() {
    draggedKeyframesB.set(new Set())
  },
  addKeyframeIdsToDragged(keyframeIds: KeyframeId[]) {
    const originalDraggedKeyframes = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      originalDraggedKeyframes.add(kfId)
    }
    draggedKeyframesB.set(originalDraggedKeyframes)
  },
  removeKeyframeIdsFromDragged(keyframeIds: KeyframeId[]) {
    const updatedDraggedKeyframes: Set<KeyframeId> = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      updatedDraggedKeyframes.delete(kfId)
    }
    draggedKeyframesB.set(updatedDraggedKeyframes)
  },
}
