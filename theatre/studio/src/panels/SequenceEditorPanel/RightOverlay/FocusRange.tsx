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

export const focusRangeTheme = {
  active: {
    backgroundColor: '#70a904',
  },
  inactive: {
    backgroundColor: '#395209',
  },
}

const focusRangeThumbWidth = 10

const Handler = styled.div`
  content: ' ';
  background-color: ${focusRangeTheme.active.backgroundColor};
  width: ${focusRangeThumbWidth};
  height: 100%;
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  left: -${focusRangeThumbWidth / 2}px;
`

const RangeStrip = styled.div`
  /* background-color: ${focusRangeTheme.active.backgroundColor}; */
  background-color: blue;
  position: absolute;
  height: 100%;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
  left: -${focusRangeThumbWidth / 2}px;
`

function clampRange(
  start: number,
  end: number,
  minWidth: number,
  maxWidth: number,
): [number, number] {
  let overflow = 0

  if (start < minWidth) {
    overflow = 0 - start
  }

  if (end > maxWidth) {
    overflow = maxWidth - end
  }

  start += overflow
  end += overflow

  return [start, end]
}

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  type: 'start' | 'end'
}> = ({layoutP, type}) => {
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
      lockCursorTo: type === 'start' ? 'w-resize' : 'e-resize',
    }
  }, [sheet])

  useDrag(thumbNode, gestureHandlers)

  return usePrism(() => {
    let existingRange = existingRangeD.getValue() || {
      range: {start: 0, end: sequence.length},
    }
    // TODO: what should be displayed when the focusRange is not set?

    const position = existingRange.range[type]

    const posInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(position)

    return (
      <Handler
        ref={thumbRef as $IntentionalAny}
        style={{
          transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
          cursor: type === 'start' ? 'w-resize' : 'e-resize',
          /* left:
            type === 'start'
              ? `${focusRangeThumbWidth / 2}px`
              : `-${focusRangeThumbWidth / 2}px`, */
          // left: 0,
        }}
      />
    )
  }, [layoutP, thumbRef, existingRangeD])
}

const FocusRangeStrip: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  console.log('rerendered')
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

  const [rangeSripRef, rangeStripNode] = useRefAndState<HTMLElement | null>(
    null,
  )

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    const defaultFocusRange = {start: 0, end: sequence.length}
    let focusRange = existingRangeD.getValue()?.range || defaultFocusRange
    let startPosBeforeDrag = focusRange.start
    let endPosBeforeDrag = focusRange.end
    let width = focusRange.end - focusRange.start
    let tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false

    return {
      onDragStart() {
        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
        startPosBeforeDrag =
          existingRangeD.getValue()?.range.start || defaultFocusRange.start
        endPosBeforeDrag =
          existingRangeD.getValue()?.range.end || defaultFocusRange.end
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, _, event) {
        dragHappened = true
        focusRange = existingRangeD.getValue()?.range || defaultFocusRange
        console.log(focusRange.end)

        const deltaPos = scaledSpaceToUnitSpace(dx)

        const [newStartPosition, newEndPosition] = clampRange(
          startPosBeforeDrag + deltaPos,
          endPosBeforeDrag + deltaPos,
          0,
          sequence.length,
        )

        if (tempTransaction) {
          tempTransaction.discard()
        }

        tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
            {
              ...sheet.address,
              range: {
                start: newStartPosition,
                end: newEndPosition,
              },
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

  useDrag(rangeStripNode, gestureHandlers)

  return usePrism(() => {
    let existingRange = existingRangeD.getValue() || {
      range: {start: 0, end: sequence.length},
    }

    const startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      existingRange.range.start,
    )
    const endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      existingRange.range.end,
    )

    return (
      <RangeStrip
        ref={rangeSripRef as $IntentionalAny}
        style={{
          transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`,
          width: endPosInClippedSpace - startPosInClippedSpace,
        }}
      />
    )
  }, [layoutP, rangeStripNode, existingRangeD])
}

const FocusRange: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return (
    <>
      <FocusRangeStrip layoutP={layoutP} />
      <FocusRangeThumb type="start" layoutP={layoutP} />
      <FocusRangeThumb type="end" layoutP={layoutP} />
    </>
  )
}

export default FocusRange
