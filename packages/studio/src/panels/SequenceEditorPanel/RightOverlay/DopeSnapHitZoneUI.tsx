import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {lockedCursorCssVarName} from '@theatre/studio/uiComponents/PointerEventsHandler'
import {css} from 'styled-components'
import SnapCursor from './SnapCursor.svg'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import DopeSnap from './DopeSnap'
import {includeLockFrameStampAttrs} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

const HIT_ZONE_SIZE_PX = 12
const SNAP_CURSOR_SIZE_PX = 34
const BEING_DRAGGED_CLASS = 'beingDragged'

/**
 * Helper CSS for consistent display of the `⸢⸤⸣⸥` thing
 */
export const DopeSnapHitZoneUI = {
  BEING_DRAGGED_CLASS,
  CSS: css`
    position: absolute;
    ${absoluteDims(HIT_ZONE_SIZE_PX)};
    ${pointerEventsAutoInNormalMode};

    &.${BEING_DRAGGED_CLASS} {
      pointer-events: none !important;
    }
  `,
  CSS_WHEN_SOMETHING_DRAGGING: css`
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});

    // ⸢⸤⸣⸥ thing
    // This box extends the hitzone so the user does not
    // accidentally leave the hitzone
    &:hover:after {
      position: absolute;
      top: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      left: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      width: ${SNAP_CURSOR_SIZE_PX}px;
      height: ${SNAP_CURSOR_SIZE_PX}px;
      display: block;
      content: ' ';
      background: url(${SnapCursor}) no-repeat 100% 100%;
      // This icon might also fit: GiConvergenceTarget
    }
  `,
  /** Intrinsic element props for `<HitZone/>`s */
  reactProps(config: {position: number; isDragging: boolean}) {
    return {
      // `data-pos` and `includeLockFrameStampAttrs` are used by FrameStampPositionProvider
      // in order to handle snapping the playhead. Adding these props effectively
      // causes the playhead to "snap" to the marker on mouse over.
      // `pointerEventsAutoInNormalMode` and `lockedCursorCssVarName` in the CSS above are also
      // used to make this behave correctly.
      ...includeLockFrameStampAttrs(config.position),
      ...DopeSnap.includePositionSnapAttrs(config.position),
      className: config.isDragging ? DopeSnapHitZoneUI.BEING_DRAGGED_CLASS : '',
    }
  },
}
