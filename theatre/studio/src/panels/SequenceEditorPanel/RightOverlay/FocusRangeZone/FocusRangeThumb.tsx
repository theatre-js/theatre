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
import {clamp} from 'lodash-es'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import {focusRangeTheme} from './FocusRangeStrip'

const Handler = styled.div`
  content: ' ';
  width: ${focusRangeTheme.thumbWidth};
  height: 100%;
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  stroke: ${focusRangeTheme.enabled.stroke};
`

const dims = (size: number) => `
  left: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const HitZone = styled.div`
  position: absolute;
  z-index: 1;
  ${() => dims(topStripHeight * 1.5)}
`

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  thumbType: keyof IRange
  isPlayingInFocusRange: boolean
}> = ({layoutP, isPlayingInFocusRange, thumbType}) => {
  const [thumbRef, thumbNode] = useRefAndState<HTMLElement | null>(null)

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

    return {
      onDragStart() {
        focusRangeEnabled = existingRangeD.getValue()?.enabled || false
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag =
          existingRangeD.getValue()?.range[thumbType] ||
          defaultFocusRange[thumbType]
      },
      onDrag(dx) {
        dragHappened = true
        range = existingRangeD.getValue()?.range || defaultFocusRange

        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition =
          thumbType === 'start'
            ? clamp(posBeforeDrag + deltaPos, 0, range['end'])
            : clamp(posBeforeDrag + deltaPos, range['start'], sequence.length)

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
        if (dragHappened && tempTransaction !== undefined) {
          tempTransaction.commit()
        } else if (tempTransaction) {
          tempTransaction.discard()
        }
        tempTransaction = undefined
      },
      lockCursorTo: thumbType === 'start' ? 'w-resize' : 'e-resize',
    }
  }, [sheet, scaledSpaceToUnitSpace])

  useDrag(thumbNode, gestureHandlers)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()
    const defaultRange = {
      range: {start: 0, end: sequence.length},
      enabled: false,
    }
    const position =
      existingRange?.range[thumbType] || defaultRange.range[thumbType]

    const posInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(position)

    let background = focusRangeTheme.disabled.backgroundColor

    if (focusRangeEnabled) {
      if (isPlayingInFocusRange) {
        background = focusRangeTheme.playing.backgroundColor
      } else {
        background = focusRangeTheme.enabled.backgroundColor
      }
    }

    return existingRange !== undefined ? (
      <>
        <Handler
          style={{
            transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
            background,
            left: `${
              thumbType === 'start' ? 0 : -focusRangeTheme.thumbWidth
            }px`,
          }}
        >
          <svg viewBox="0 0 9 18" xmlns="http://www.w3.org/2000/svg">
            <line x1="4" y1="6" x2="4" y2="12" />
            <line x1="6" y1="6" x2="6" y2="12" />
          </svg>
        </Handler>
        <HitZone
          ref={thumbRef as $IntentionalAny}
          data-pos={position.toFixed(3)}
          style={{
            transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
            cursor: thumbType === 'start' ? 'w-resize' : 'e-resize',
            pointerEvents: focusRangeEnabled ? 'auto' : 'none',
          }}
        />
      </>
    ) : (
      <></>
    )
  }, [
    layoutP,
    thumbRef,
    existingRangeD,
    focusRangeEnabled,
    isPlayingInFocusRange,
  ])
}

export default FocusRangeThumb
