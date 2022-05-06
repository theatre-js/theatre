import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import type {$IntentionalAny, IRange} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {
  topStripHeight,
  topStripTheme,
} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {
  lockedCursorCssVarName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {
  includeLockFrameStampAttrs,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {focusRangeStripTheme, RangeStrip} from './FocusRangeStrip'
import type Sheet from '@theatre/core/sheets/Sheet'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'

const TheDiv = styled.div<{enabled: boolean; type: 'start' | 'end'}>`
  position: absolute;
  top: 0;
  // the right handle has to be pulled back by its width since its right side indicates its position, not its left side
  left: ${(props) =>
    props.type === 'start' ? 0 : -focusRangeStripTheme.thumbWidth}px;
  transform-origin: left top;
  width: ${focusRangeStripTheme.thumbWidth}px;
  height: ${() => topStripHeight - 1}px;
  z-index: 3;

  background-color: ${({enabled}) =>
    enabled
      ? focusRangeStripTheme.enabled.backgroundColor
      : focusRangeStripTheme.disabled.backgroundColor};

  stroke: ${focusRangeStripTheme.enabled.stroke};
  user-select: none;

  cursor: ${(props) => (props.type === 'start' ? 'w-resize' : 'e-resize')};

  // no pointer events unless pointer-root is in normal mode _and_ the
  // focus range is enabled
  #pointer-root & {
    pointer-events: none;
  }

  #pointer-root.normal & {
    pointer-events: auto;
  }

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  &.dragging {
    pointer-events: none !important;
  }

  // highlight the handle when it's being dragged or the whole strip is being dragged
  &.dragging,
  ${() => RangeStrip}.dragging ~ & {
    background: ${focusRangeStripTheme.dragging.backgroundColor};
    stroke: ${focusRangeStripTheme.dragging.stroke};
  }

  #pointer-root.draggingPositionInSequenceEditor &:hover {
    background: ${focusRangeStripTheme.dragging.backgroundColor};
    stroke: #40aaa4;
  }

  // highlight the handle if it's hovered, or the whole strip is hovverd
  ${() => RangeStrip}:hover ~ &, &:hover {
    background: ${focusRangeStripTheme.hover.backgroundColor};
    stroke: ${focusRangeStripTheme.hover.stroke};
  }

  // a larger hit zone
  &:before {
    display: block;
    content: ' ';
    position: absolute;
    inset: -8px;
  }
`

/**
 * This acts as a bit of a horizontal shadow that covers the frame numbers that show up
 * right next to the thumb, making the appearance of the focus range more tidy.
 */
const ColoredMargin = styled.div<{type: 'start' | 'end'; enabled: boolean}>`
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;

  ${() => RangeStrip}.dragging ~ ${TheDiv} > & {
    --bg: ${focusRangeStripTheme.dragging.backgroundColor};
  }

  --bg: ${({enabled}) =>
    enabled
      ? focusRangeStripTheme.enabled.backgroundColor
      : focusRangeStripTheme.disabled.backgroundColor};

  // highlight the handle if it's hovered, or the whole strip is hovverd
  ${() => RangeStrip}:hover ~ ${TheDiv} > & {
    --bg: ${focusRangeStripTheme.hover.backgroundColor};
  }

  background: linear-gradient(
    ${(props) => (props.type === 'start' ? 90 : -90)}deg,
    var(--bg) 0%,
    #ffffff00 100%
  );

  width: 12px;
  left: ${(props) =>
    props.type === 'start'
      ? focusRangeStripTheme.thumbWidth
      : // pushing the right-side thumb's margin 1px to the right to make sure there is no space
        // between it and the thumb
        -focusRangeStripTheme.thumbWidth + 1}px;
`

const OuterColoredMargin = styled.div<{
  type: 'start' | 'end'
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;

  --bg: ${() => topStripTheme.backgroundColor};

  background: linear-gradient(
    ${(props) => (props.type === 'start' ? -90 : 90)}deg,
    var(--bg) 0%,
    #ffffff00 100%
  );

  width: 12px;
  left: ${(props) =>
    props.type === 'start' ? -12 : focusRangeStripTheme.thumbWidth}px;
`

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  thumbType: keyof IRange
}> = ({layoutP, thumbType}) => {
  const [hitZoneRef, hitZoneNode] = useRefAndState<HTMLElement | null>(null)

  const existingRangeD = useMemo(
    () =>
      prism(() => {
        const {projectId, sheetId} = val(layoutP.sheet).address
        const existingRange = val(
          getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
            .stateBySheetId[sheetId].sequence.focusRange,
        )
        return existingRange
      }),
    [layoutP],
  )

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let defaultRange: IRange
    let range: IRange
    let focusRangeEnabled: boolean
    let posBeforeDrag: number
    let tempTransaction: CommitOrDiscard | undefined
    let minFocusRangeStripWidth: number
    let sheet: Sheet
    let scaledSpaceToUnitSpace: (s: number) => number

    return {
      debugName: 'FocusRangeThumb',
      onDragStart() {
        sheet = val(layoutP.sheet)
        const sequence = sheet.getSequence()
        defaultRange = {start: 0, end: sequence.length}
        let existingRange = existingRangeD.getValue() || {
          range: defaultRange,
          enabled: false,
        }
        focusRangeEnabled = existingRange.enabled

        posBeforeDrag = existingRange.range[thumbType]
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        minFocusRangeStripWidth = scaledSpaceToUnitSpace(
          focusRangeStripTheme.rangeStripMinWidth,
        )
      },
      onDrag(dx, _, event) {
        let newPosition: number
        const snapPos = DopeSnap.checkIfMouseEventSnapToPos(event, {
          ignore: hitZoneNode,
        })
        if (snapPos != null) {
          newPosition = snapPos
        }

        range = existingRangeD.getValue()?.range || defaultRange
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const oldPosPlusDeltaPos = posBeforeDrag + deltaPos
        // Make sure that the focus range has a minimal width
        if (thumbType === 'start') {
          // Prevent the start thumb from going below 0
          newPosition = Math.max(
            Math.min(
              oldPosPlusDeltaPos,
              range['end'] - minFocusRangeStripWidth,
            ),
            0,
          )
        } else {
          // Prevent the start thumb from going over the length of the sequence
          newPosition = Math.min(
            Math.max(
              oldPosPlusDeltaPos,
              range['start'] + minFocusRangeStripWidth,
            ),
            sheet.getSequence().length,
          )
        }

        const newPositionInFrame = sheet
          .getSequence()
          .closestGridPosition(newPosition)

        if (tempTransaction !== undefined) {
          tempTransaction.discard()
        }

        tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
            {
              ...sheet.address,
              range: {...range, [thumbType]: newPositionInFrame},
              enabled: focusRangeEnabled,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        if (dragHappened) tempTransaction?.commit()
        else tempTransaction?.discard()
      },
    }
  }, [layoutP])

  const [isDragging] = useDrag(hitZoneNode, gestureHandlers)

  useCssCursorLock(
    isDragging,
    'draggingPositionInSequenceEditor',
    thumbType === 'start' ? 'w-resize' : 'e-resize',
  )

  const existingRange = useVal(existingRangeD)

  useLockFrameStampPosition(isDragging, existingRange?.range[thumbType] ?? 0)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()
    if (!existingRange) return null
    const {enabled} = existingRange

    const position = existingRange.range[thumbType]

    let posInClippedSpace: number = val(layoutP.clippedSpace.fromUnitSpace)(
      position,
    )

    if (
      posInClippedSpace < 0 ||
      val(layoutP.clippedSpace.width) < posInClippedSpace
    ) {
      posInClippedSpace = -10000
    }

    return (
      <TheDiv
        ref={hitZoneRef as $IntentionalAny}
        {...DopeSnap.includePositionSnapAttrs(position)}
        {...includeLockFrameStampAttrs(position)}
        className={`${isDragging && 'dragging'} ${enabled && 'enabled'}`}
        enabled={enabled}
        type={thumbType}
        style={{
          transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
        }}
      >
        <ColoredMargin type={thumbType} enabled={enabled} />
        <OuterColoredMargin type={thumbType} />
        <svg viewBox="0 0 9 18" xmlns="http://www.w3.org/2000/svg">
          <line x1="4" y1="6" x2="4" y2="12" />
          <line x1="6" y1="6" x2="6" y2="12" />
        </svg>
      </TheDiv>
    )
  }, [layoutP, hitZoneRef, existingRangeD, isDragging])
}

export default FocusRangeThumb
