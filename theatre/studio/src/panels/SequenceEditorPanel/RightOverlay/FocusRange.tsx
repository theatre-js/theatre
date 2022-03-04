import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React, {useMemo} from 'react'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import styled from 'styled-components'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {clamp} from 'lodash-es'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'

const Handler = styled.div`
  background-color: blue;
  width: 20px;
  height: 100%;
  position: absolute;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  type: 'start' | 'end'
}> = ({layoutP, type}) => {
  const [startRef, startNode] = useRefAndState<HTMLElement | null>(null)

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

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    const defaultFocusRange = {start: 0, end: sequence.length}
    let focusRange = existingRangeD.getValue()?.range || defaultFocusRange
    let posBeforeDrag = focusRange[type]
    let tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false

    return {
      onDragStart() {
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag =
          existingRangeD.getValue()?.range[type] || defaultFocusRange[type]
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, _, event) {
        dragHappened = true
        focusRange = existingRangeD.getValue()?.range || defaultFocusRange

        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition =
          type === 'start'
            ? clamp(posBeforeDrag + deltaPos, 0, focusRange['end'])
            : clamp(
                posBeforeDrag + deltaPos,
                focusRange['start'],
                sequence.length,
              )

        if (tempTransaction) {
          tempTransaction.discard()
        }

        tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
            {
              ...sheet.address,
              range: {...focusRange, [type]: newPosition},
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

  useDrag(startNode, gestureHandlers)

  return usePrism(() => {
    let existingRange = existingRangeD.getValue() || {
      range: {start: 0, end: sequence.length},
    }
    // TODO: what should be displayed when the focusRange is not set?

    const position = existingRange.range[type]

    const posInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(position)

    return (
      <Handler
        ref={startRef as $IntentionalAny}
        style={{transform: `translate3d(${posInClippedSpace}px, 0, 0)`}}
      />
    )
  }, [layoutP, startRef, existingRangeD])
}

const FocusRange: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return (
    <>
      <FocusRangeThumb type="start" layoutP={layoutP} />
      <FocusRangeThumb type="end" layoutP={layoutP} />
    </>
  )
}

export default FocusRange
