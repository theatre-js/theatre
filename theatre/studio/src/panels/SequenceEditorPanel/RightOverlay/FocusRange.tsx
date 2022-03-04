import useOnKeyDown from '@theatre/studio/uiComponents/useOnKeyDown'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {Pointer, prism} from '@theatre/dataverse'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React, {useMemo, useState} from 'react'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import styled from 'styled-components'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {clamp} from 'lodash-es'
import getStudio from '@theatre/studio/getStudio'
import {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'

const RangeStart = styled.div`
  background-color: blue;
  width: 20px;
  left: -20px;
  height: 100%;
  position: absolute;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const RangeEnd = styled.div`
  background-color: green;
  width: 20px;
  height: 100%;
  position: absolute;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const FocusRange: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  className: string
}> = ({layoutP, className}) => {
  const [startRef, startNode] = useRefAndState<HTMLElement | null>(null)
  const [endRef, endNode] = useRefAndState<HTMLElement | null>(null)

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
  let sequence = sheet.getSequence()

  const startGestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    let posBeforeDrag = 0
    let tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false

    return {
      onDragStart() {
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag = existingRangeD.getValue()?.range.start || 0
        // position before drag
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, _, event) {
        dragHappened = true
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition = clamp(posBeforeDrag + deltaPos, 0, sequence.length)

        if (tempTransaction) {
          tempTransaction.discard()
        }

        tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
            {
              ...sheet.address,
              // todo
              range: {start: 0, end: 0},
            },
          )
        })
      },
      onDragEnd() {
        if (dragHappened) {
          if (tempTransaction) {
            tempTransaction.commit()
          }
        } else {
          if (tempTransaction) {
            tempTransaction.discard()
          }
        }
        tempTransaction = undefined
      },
      lockCursorTo: 'ew-resize',
    }
  }, [sheet])

  const endGestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    // let sequence: Sequence
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    let posBeforeDrag = endPosition

    return {
      onDragStart() {
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag = endPosition
        // position before drag
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        console.log('drag start')
      },
      onDrag(dx, _, event) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition = clamp(posBeforeDrag + deltaPos, 0, sequence.length)
        // endPosInClippedSpace = newPosition
        setEndPosition(newPosition)
        window.endPos = newPosition
        console.log('being dragged')
      },
      onDragEnd() {
        console.log('drag end')
      },
      lockCursorTo: 'ew-resize',
    }
  }, [])

  useDrag(startNode, startGestureHandlers)
  useDrag(endNode, endGestureHandlers)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()
    // todo: what to show here?
    if (typeof existingRange === 'undefined') return <></>

    const startPosition = existingRange.range.start
    const endPosition = existingRange.range.end

    const startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      startPosition,
    )
    const endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      endPosition,
    )

    let width = val(layoutP.clippedSpace.fromUnitSpace)(
      endPosition - startPosition,
    )

    return (
      <div
        className={className}
        style={{
          width: `${width}px`,
        }}
      >
        <RangeStart
          ref={startRef as $IntentionalAny}
          onClick={() => alert('clicked')}
          style={{transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`}}
        />
        <RangeEnd
          ref={endRef as $IntentionalAny}
          onClick={() => alert('clicked')}
          style={{transform: `translate3d(${endPosInClippedSpace}px, 0, 0)`}}
        />
      </div>
    )
  }, [layoutP, startRef, endRef, existingRangeD])
}

export default FocusRange
