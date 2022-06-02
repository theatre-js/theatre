import type {KeyframeId} from '@theatre/shared/utils/ids'

export type IDraggedKeyframes = Set<KeyframeId>

/**
 * The ids of the keyframes that are being dragged
 */
export let draggedKeyframes: IDraggedKeyframes = new Set()

/**
 * Utils for the set of the dragged keyframes
 */
export const draggedKeyframesUtils = {
  resetDraggedKeyframes(): void {
    if (draggedKeyframes.size > 0) {
      draggedKeyframes = new Set()
    }
  },
  addKeyframeIdsToDragged(keyframeIds: KeyframeId[]): void {
    for (let kfId of keyframeIds) {
      draggedKeyframes.add(kfId)
    }
  },
}
