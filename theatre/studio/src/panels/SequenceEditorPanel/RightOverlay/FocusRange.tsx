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
import type {$IntentionalAny, IRange} from '@theatre/shared/utils/types'
import {clamp} from 'lodash-es'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'

export const focusRangeTheme = {
  active: {
    backgroundColor: '#70a904',
  },
  inactive: {
    backgroundColor: '#395209',
  },
  height: 5,
  thumbWidth: 10,
}

// TODO: find a solution for re-using the topStripHeight from the `TopStrip.tsx` file
const topStripHeight = 20

export const focusRangeThumbWidth = 10

const Handler = styled.div`
  content: ' ';
  background-color: ${focusRangeTheme.active.backgroundColor};
  width: ${focusRangeTheme.thumbWidth};
  height: 100%;
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  left: -${focusRangeTheme.thumbWidth / 2}px;
`

const RangeStrip = styled.div`
  /* background-color: ${focusRangeTheme.active.backgroundColor}; */
  background-color: blue;
  position: absolute;
  height: 100%;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const Container = styled.div`
  position: absolute;
  top: ${topStripHeight}px;
  left: 0;
  right: 0;
  height: ${focusRangeTheme.height};
  background-color: ${focusRangeTheme.inactive.backgroundColor};
  box-sizing: border-box;
  overflow: hidden;
`

function clampRange(
  start: number,
  end: number,
  minWidth: number,
  maxWidth: number,
  createRange: boolean = false,
): [number, number] {
  let overflow = 0

  if (start < minWidth) {
    overflow = 0 - start
  }

  if (end > maxWidth) {
    overflow = maxWidth - end
  }

  if (createRange === false) start += overflow
  end += overflow

  return [start, end]
}

const FocusRangeThumb: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  thumbType: keyof IRange
}> = ({layoutP, thumbType}) => {
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
  const focusRangeEnabled = existingRangeD.getValue()?.enabled || false

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
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
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx) {
        dragHappened = true
        range = existingRangeD.getValue()?.range || defaultFocusRange

        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition =
          thumbType === 'start'
            ? clamp(posBeforeDrag + deltaPos, 0, range['end'])
            : clamp(posBeforeDrag + deltaPos, range['start'], sequence.length)

        if (tempTransaction) {
          tempTransaction.discard()
        }

        tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
          stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
            {
              ...sheet.address,
              range: {...range, [thumbType]: newPosition},
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
  }, [sheet])

  useDrag(thumbNode, gestureHandlers)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue() || {
      range: {start: 0, end: sequence.length},
      enabled: false,
    }
    const position = existingRange.range[thumbType]

    const posInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(position)

    return focusRangeEnabled ? (
      <Handler
        ref={thumbRef as $IntentionalAny}
        style={{
          transform: `translate3d(${posInClippedSpace}px, 0, 0)`,
          cursor: thumbType === 'start' ? 'w-resize' : 'e-resize',
          // TODO: remove the next line later
          background: 'blue',
        }}
      />
    ) : (
      <></>
    )
  }, [layoutP, thumbRef, existingRangeD, focusRangeEnabled])
}

const FocusRangeStrip: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
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

  const [rangeStripRef, rangeStripNode] = useRefAndState<HTMLElement | null>(
    null,
  )

  const [contextMenu] = useContextMenu(rangeStripNode, {
    items: () => {
      return [
        {
          label: 'Delete focus range',
          callback: () => {
            getStudio()
              .tempTransaction(({stateEditors}) => {
                stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
                  {
                    ...sheet.address,
                    range: {start: 0, end: sequence.length},
                    enabled: false,
                  },
                )
              })
              .commit()
          },
        },
      ]
    },
  })

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    const defaultRange = {start: 0, end: sequence.length}
    let range: IRange
    let focusRangeEnabled: boolean,
      startPosBeforeDrag: number,
      endPosBeforeDrag: number,
      tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false
    let createRange = false

    return {
      onDragStart(event) {
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        range = existingRangeD.getValue()?.range || defaultRange
        focusRangeEnabled = existingRangeD.getValue()?.enabled || false

        if (event.shiftKey && focusRangeEnabled === false) {
          focusRangeEnabled = true
          createRange = true

          const targetElement: HTMLElement = event.target as HTMLElement
          const rect = targetElement!.getBoundingClientRect()
          startPosBeforeDrag = scaledSpaceToUnitSpace(event.clientX - rect.left)
          endPosBeforeDrag = startPosBeforeDrag

          getStudio()
            .tempTransaction(({stateEditors}) => {
              stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
                {
                  ...sheet.address,
                  range: {start: startPosBeforeDrag, end: endPosBeforeDrag},
                  enabled: focusRangeEnabled,
                },
              )
            })
            .commit()
        } else {
          startPosBeforeDrag = range.start
          endPosBeforeDrag = range.end
        }

        dragHappened = false
        sequence = val(layoutP.sheet).getSequence()
      },
      onDrag(dx) {
        dragHappened = true
        range = existingRangeD.getValue()?.range || defaultRange

        const deltaPos = scaledSpaceToUnitSpace(dx)

        let newStartPosition: number, newEndPosition: number

        let start = startPosBeforeDrag
        let end = endPosBeforeDrag + deltaPos

        if (createRange === false) {
          start += deltaPos
        }

        if (end < start) {
          end = start
        }

        ;[newStartPosition, newEndPosition] = clampRange(
          start,
          end,
          0,
          sequence.length,
          createRange,
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
              enabled: focusRangeEnabled,
            },
          )
        })
      },
      onDragEnd() {
        createRange = false
        if (dragHappened && tempTransaction !== undefined) {
          tempTransaction.commit()
        } else if (tempTransaction) {
          tempTransaction.discard()
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
      enabled: false,
    }

    const startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      existingRange.range.start,
    )
    const endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      existingRange.range.end,
    )

    return (
      <>
        {contextMenu}
        <RangeStrip
          ref={rangeStripRef as $IntentionalAny}
          onContextMenuCapture={(e) => {
            if (existingRange.enabled !== true) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          style={{
            transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`,
            width: endPosInClippedSpace - startPosInClippedSpace,
            backgroundColor: existingRange.enabled
              ? focusRangeTheme.active.backgroundColor
              : focusRangeTheme.inactive.backgroundColor,
          }}
        />
      </>
    )
  }, [layoutP, rangeStripRef, existingRangeD, contextMenu])
}

const FocusRange: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return (
    <Container>
      <FocusRangeStrip layoutP={layoutP} />
      <FocusRangeThumb thumbType="start" layoutP={layoutP} />
      <FocusRangeThumb thumbType="end" layoutP={layoutP} />
    </Container>
  )
}

export default FocusRange
