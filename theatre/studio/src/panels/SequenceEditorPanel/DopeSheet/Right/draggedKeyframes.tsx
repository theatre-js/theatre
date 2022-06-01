import {Box} from '@theatre/dataverse'

export const draggedKeyframesB: Box<Set<string>> = new Box(new Set())

export const draggedKeyframesUtils = {
  resetDraggedKeyframes() {
    draggedKeyframesB.set(new Set())
  },
  addKeyframeIdsToDragged(keyframeIds: string[]) {
    const originalDraggedKeyframes = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      originalDraggedKeyframes.add(kfId)
    }
    draggedKeyframesB.set(originalDraggedKeyframes)
  },
  removeKeyframeIdsFromDragged(keyframeIds: string[]) {
    const updatedDraggedKeyframes: Set<string> = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      updatedDraggedKeyframes.delete(kfId)
    }
    draggedKeyframesB.set(updatedDraggedKeyframes)
  },
}
