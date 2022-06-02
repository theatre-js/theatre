import {Box} from '@theatre/dataverse'
import type {KeyframeId} from '@theatre/shared/utils/ids'

export type IDraggedKeyframes = Set<KeyframeId>

/**
 * The ids of the keyframes that are being dragged
 */
export const draggedKeyframesB: Box<Set<KeyframeId>> = new Box(new Set())

/**
 * Utils for the set of the dragged keyframes
 */
type IDraggedKeyframesUtils = {
  resetDraggedKeyframes: () => void
  addKeyframeIdsToDragged: (keyframeIds: KeyframeId[]) => void
  removeKeyframeIdsFromDragged: (keyframeIds: KeyframeId[]) => void
}

/**
 * See {@link IDraggedKeyframesUtils} for the docs
 */
export const draggedKeyframesUtils: IDraggedKeyframesUtils = {
  resetDraggedKeyframes(): void {
    const originalKeyframes = draggedKeyframesB.get()
    if (originalKeyframes.size > 0) {
      draggedKeyframesB.set(new Set())
    }
  },
  addKeyframeIdsToDragged(keyframeIds: KeyframeId[]): void {
    const originalDraggedKeyframes = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      originalDraggedKeyframes.add(kfId)
    }
    draggedKeyframesB.set(originalDraggedKeyframes)
  },
  // Q: Are we using this anywhere?
  removeKeyframeIdsFromDragged(keyframeIds: KeyframeId[]): void {
    const updatedDraggedKeyframes: Set<KeyframeId> = draggedKeyframesB.get()
    for (let kfId of keyframeIds) {
      updatedDraggedKeyframes.delete(kfId)
    }
    draggedKeyframesB.set(updatedDraggedKeyframes)
  },
}
