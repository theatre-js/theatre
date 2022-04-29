import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny, IRange} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import {
  attributeNameThatLocksFramestamp,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {focusRangeStripTheme, RangeStrip} from './FocusRangeStrip'
import SnapCursor from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/SnapCursor.svg'

const snapCursorSize = 42

const dims = (size: number) => `
  left: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const HitZone = styled.div<{enabled: boolean; type: 'start' | 'end'}>`
  top: 0;
  left: 0;
  transform-origin: left top;
  position: absolute;
  z-index: 3;
  cursor: ${(props) => (props.type === 'start' ? 'w-resize' : 'e-resize')};
  // no pointer events unless pointer-root is in normal mode _and_ the
  // focus range is enabled
  #pointer-root & {
    pointer-events: none;
  }
  #pointer-root.normal & {
    pointer-events: ${(props) => (props.enabled ? 'auto' : 'none')};
  }

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: none;

    &:hover:after {
      position: absolute;
      top: calc(50% - ${snapCursorSize / 2}px);
      left: calc(50% - ${snapCursorSize / 2}px);
      width: ${snapCursorSize}px;
      height: ${snapCursorSize}px;
      display: block;
      content: ' ';
      background: url(${SnapCursor}) no-repeat;
      background-size: cover;
      z-index: 30;
    }
  }

  &.dragging {
    pointer-events: none !important;
  }

  ${dims(focusRangeStripTheme.hitZoneWidth)}
`

const startHandlerOffset = focusRangeStripTheme.hitZoneWidth / 2
const endHandlerOffset = startHandlerOffset - focusRangeStripTheme.thumbWidth

const Handle = styled.div<{enabled: boolean; type: 'start' | 'end'}>`
  content: ' ';
  width: ${focusRangeStripTheme.thumbWidth}px;
  height: ${() => topStripHeight - 1}px;
  position: absolute;
  stroke: ${focusRangeStripTheme.enabled.stroke};
  user-select: none;

  background-color: ${({enabled}) =>
    enabled
      ? focusRangeStripTheme.enabled.backgroundColor
      : focusRangeStripTheme.disabled.backgroundColor};

  left: ${(props) =>
    props.type === 'start' ? startHandlerOffset : endHandlerOffset}px;

  ${HitZone}.dragging > &, ${() => RangeStrip}.dragging ~ ${HitZone} > & {
    background: ${focusRangeStripTheme.dragging.backgroundColor};
    stroke: ${focusRangeStripTheme.dragging.stroke};
  }

  #pointer-root.draggingPositionInSequenceEditor ${HitZone}:hover > & {
    background: ${focusRangeStripTheme.dragging.backgroundColor};
    stroke: #40aaa4;
  }

  ${() => RangeStrip}:hover ~ ${HitZone} > &, ${HitZone}:hover > & {
    background: ${focusRangeStripTheme.hover.backgroundColor};
    stroke: ${focusRangeStripTheme.hover.stroke};
  }
`

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  thumbType: keyof IRange
}> = ({layoutP, thumbType}) => {
  const [hitZoneRef, hitZoneNode] = useRefAndState<HTMLElement | null>(null)
  const handlerRef = useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

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

  const sheet = val(layoutP.sheet)
  const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
  let sequence = sheet.getSequence()

  const enabled = existingRangeD.getValue()?.enabled || false

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    const defaultRange = {start: 0, end: sequence.length}
    let range = existingRangeD.getValue()?.range || defaultRange
    let focusRangeEnabled: boolean
    let posBeforeDrag = range[thumbType]
    let tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false
    let originalBackground: string
    let originalStroke: string
    let minFocusRangeStripWidth: number

    return {
      onDragStart() {
        let existingRange = existingRangeD.getValue() || {
          range: defaultRange,
          enabled: false,
        }
        focusRangeEnabled = existingRange.enabled
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag = existingRange.range[thumbType]
        minFocusRangeStripWidth = scaledSpaceToUnitSpace(
          focusRangeStripTheme.rangeStripMinWidth,
        )

        setIsDragging(true)
      },
      onDrag(dx, _, event) {
        dragHappened = true
        range = existingRangeD.getValue()?.range || defaultRange

        const deltaPos = scaledSpaceToUnitSpace(dx)
        let newPosition: number
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
            sequence.length,
          )
        }

        // Enable snapping
        const snapTarget = event
          .composedPath()
          .find(
            (el): el is Element =>
              el instanceof Element &&
              el !== hitZoneNode &&
              el.hasAttribute('data-pos'),
          )

        if (snapTarget) {
          const snapPos = parseFloat(snapTarget.getAttribute('data-pos')!)

          if (isFinite(snapPos)) {
            newPosition = snapPos
          }
        }

        const newPositionInFrame = sequence.closestGridPosition(newPosition)

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
      onDragEnd() {
        if (handlerRef.current) {
          setIsDragging(false)
        }
        if (dragHappened && tempTransaction !== undefined) {
          tempTransaction.commit()
        } else if (tempTransaction) {
          tempTransaction.discard()
        }
      },
      lockCursorTo: thumbType === 'start' ? 'w-resize' : 'e-resize',
    }
  }, [sheet, scaledSpaceToUnitSpace])

  useDrag(hitZoneNode, gestureHandlers)

  useCssCursorLock(
    isDragging,
    'draggingPositionInSequenceEditor',
    thumbType === 'start' ? 'w-resize' : 'e-resize',
  )

  useLockFrameStampPosition(isDragging, -1)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()
    const defaultRange = {
      range: {start: 0, end: sequence.length},
      enabled: false,
    }
    const position =
      existingRange?.range[thumbType] || defaultRange.range[thumbType]

    let posInClippedSpace: number = val(layoutP.clippedSpace.fromUnitSpace)(
      position,
    )

    if (
      posInClippedSpace < 0 ||
      val(layoutP.clippedSpace.width) < posInClippedSpace
    ) {
      posInClippedSpace = -1000
    }

    return existingRange !== undefined ? (
      <>
        <HitZone
          ref={hitZoneRef as $IntentionalAny}
          data-pos={position.toFixed(3)}
          {...{
            [attributeNameThatLocksFramestamp]: position.toFixed(3),
          }}
          className={`${isDragging && 'dragging'}`}
          enabled={enabled}
          type={thumbType}
          style={{
            transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
          }}
        >
          <Handle
            enabled={enabled}
            type={thumbType}
            ref={handlerRef as $IntentionalAny}
          >
            <svg viewBox="0 0 9 18" xmlns="http://www.w3.org/2000/svg">
              <line x1="4" y1="6" x2="4" y2="12" />
              <line x1="6" y1="6" x2="6" y2="12" />
            </svg>
          </Handle>
        </HitZone>
      </>
    ) : (
      <></>
    )
  }, [layoutP, hitZoneRef, existingRangeD, enabled, isDragging])
}

export default FocusRangeThumb
