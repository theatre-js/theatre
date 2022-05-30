// Pretty much same code as for keyframe and similar for playhead.
// Consider if we should unify the implementations.
// - See "useLockFrameStampPosition"

import {mvpDontSnapToMyself} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregateKeyframeEditor/mvpDontSnapToMyself'

// - Also see "pointerPositionInUnitSpace" for a related impl (for different problem)
const POSITION_SNAP_ATTR = 'data-pos'

/**
 * Uses `[data-pos]` attribute to understand potential snap targets.
 */
const DopeSnap = {
  checkIfMouseEventSnapToPos(
    event: MouseEvent,
    options?: {ignore?: Element | null},
  ): number | null {
    const snapTarget = event
      .composedPath()
      .find(
        (el): el is Element =>
          el instanceof Element &&
          el !== options?.ignore &&
          el.hasAttribute(POSITION_SNAP_ATTR),
      )

    if (snapTarget) {
      const snapPos = parseFloat(snapTarget.getAttribute(POSITION_SNAP_ATTR)!)
      if (isFinite(snapPos)) {
        if (!mvpDontSnapToMyself.canSnap(snapPos)) return null
        mvpDontSnapToMyself.updateLastSnap(snapPos)

        return snapPos
      }
    }

    return null
  },

  /**
   * Use as a spread in a React element
   *
   * @example
   * ```tsx
   * <div {...DopeSnap.includePositionSnapAttrs(10)}/>
   * ```
   */
  includePositionSnapAttrs(position: number) {
    if (!mvpDontSnapToMyself.canSnap(position)) return {}

    return {[POSITION_SNAP_ATTR]: position}
  },
}

export default DopeSnap
