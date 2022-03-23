import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny, IRange} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import {focusRangeStripTheme} from './FocusRangeStrip'

const Handler = styled.div`
  content: ' ';
  width: ${focusRangeStripTheme.thumbWidth};
  height: ${() => topStripHeight};
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  stroke: ${focusRangeStripTheme.enabled.stroke};
  user-select: none;
  &:hover {
    background: ${focusRangeStripTheme.highlight.backgroundColor} !important;
  }
`

const dims = (size: number) => `
  left: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const HitZone = styled.div`
  top: 0;
  left: 0;
  transform-origin: left top;
  position: absolute;
  z-index: 3;
  ${() => dims(focusRangeStripTheme.hitZoneWidth)}
`

const Tooltip = styled.div`
  font-size: 10px;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 2px;
  ${pointerEventsAutoInNormalMode};
  background-color: #0000004d;
  display: none;
  position: absolute;
  top: -${() => topStripHeight + 2};
  transform: translateX(-50%);
  ${HitZone}:hover &, ${HitZone}.dragging & {
    display: block;
    color: white;
    background-color: '#000000';
  }
`

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  thumbType: keyof IRange
}> = ({layoutP, thumbType}) => {
  const [hitZoneRef, hitZoneNode] = useRefAndState<HTMLElement | null>(null)
  const handlerRef = useRef<HTMLElement | null>(null)

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

  const focusRangeEnabled = existingRangeD.getValue()?.enabled || false

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    const defaultFocusRange = {start: 0, end: sequence.length}
    let range = existingRangeD.getValue()?.range || defaultFocusRange
    let focusRangeEnabled: boolean
    let posBeforeDrag =
      typeof range !== 'undefined'
        ? range[thumbType]
        : defaultFocusRange[thumbType]
    let tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false
    let originalBackground: string
    let originalStroke: string
    let minFocusRangeStripWidth: number

    return {
      onDragStart() {
        focusRangeEnabled = existingRangeD.getValue()?.enabled || false
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag =
          existingRangeD.getValue()?.range[thumbType] ||
          defaultFocusRange[thumbType]
        minFocusRangeStripWidth = scaledSpaceToUnitSpace(
          focusRangeStripTheme.rangeStripMinWidth,
        )

        if (handlerRef.current) {
          originalBackground = handlerRef.current.style.background
          originalStroke = handlerRef.current.style.stroke
          handlerRef.current.style.background =
            focusRangeStripTheme.highlight.backgroundColor
          handlerRef.current.style.stroke =
            focusRangeStripTheme.highlight.stroke
        }
      },
      onDrag(dx) {
        dragHappened = true
        range = existingRangeD.getValue()?.range || defaultFocusRange

        const deltaPos = scaledSpaceToUnitSpace(dx)
        let newPosition: number
        const oldPosPlusDeltaPos = posBeforeDrag + deltaPos

        if (thumbType === 'start') {
          newPosition = Math.max(
            Math.min(
              oldPosPlusDeltaPos,
              range['end'] - minFocusRangeStripWidth,
            ),
            0,
          )
        } else {
          newPosition = Math.min(
            Math.max(
              oldPosPlusDeltaPos,
              range['start'] + minFocusRangeStripWidth,
            ),
            sequence.length,
          )
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
          if (originalBackground) {
            handlerRef.current.style.background = originalBackground
          }
          if (originalBackground) {
            handlerRef.current.style.stroke = originalStroke
          }
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

    const pointerEvents = focusRangeEnabled ? 'auto' : 'none'

    let background = focusRangeEnabled
      ? focusRangeStripTheme.disabled.backgroundColor
      : focusRangeStripTheme.enabled.backgroundColor

    const startHandlerOffset = focusRangeStripTheme.hitZoneWidth / 2
    const endHandlerOffset =
      startHandlerOffset - focusRangeStripTheme.thumbWidth

    return existingRange !== undefined ? (
      <>
        <HitZone
          ref={hitZoneRef as $IntentionalAny}
          data-pos={position.toFixed(3)}
          style={{
            transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
            cursor: thumbType === 'start' ? 'w-resize' : 'e-resize',
            pointerEvents,
          }}
        >
          <Handler
            ref={handlerRef as $IntentionalAny}
            style={{
              background,
              left: `${
                thumbType === 'start' ? startHandlerOffset : endHandlerOffset
              }px`,
              pointerEvents,
            }}
          >
            <svg viewBox="0 0 9 18" xmlns="http://www.w3.org/2000/svg">
              <line x1="4" y1="6" x2="4" y2="12" />
              <line x1="6" y1="6" x2="6" y2="12" />
            </svg>
            <Tooltip>
              {sequence.positionFormatter.formatBasic(sequence.length)}
            </Tooltip>
          </Handler>
        </HitZone>
      </>
    ) : (
      <></>
    )
  }, [layoutP, hitZoneRef, existingRangeD, focusRangeEnabled])
}

export default FocusRangeThumb
