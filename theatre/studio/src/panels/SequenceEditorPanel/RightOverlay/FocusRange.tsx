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
  enabled: {
    backgroundColor: '#70a904',
    opacity: 0.3,
  },
  disabled: {
    backgroundColor: '#70a904',
    opacity: 0.15,
  },
  height: 5,
  thumbWidth: 10,
}

// TODO: find a solution for re-using the topStripHeight from the `TopStrip.tsx` file
const topStripHeight = 20

export const focusRangeThumbWidth = 10

const Handler = styled.div`
  content: ' ';
  background-color: ${focusRangeTheme.enabled.backgroundColor};
  width: ${focusRangeTheme.thumbWidth};
  height: 100%;
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  left: -${focusRangeTheme.thumbWidth / 2}px;
`

const RangeStrip = styled.div`
  /* background-color: ${focusRangeTheme.enabled.backgroundColor}; */
  position: absolute;
  height: 100%;
  opacity: ${focusRangeTheme.enabled.opacity};
  /* transition: opacity 150ms; */
  /* opacity: ${focusRangeTheme.disabled.opacity}; */
  /* TODO: find out the line below doesn't work when the strip is being dragged */
  /* &:hover {
    opacity: ${focusRangeTheme.enabled.opacity};
  } */
  ${pointerEventsAutoInNormalMode};
`

const Container = styled.div`
  position: absolute;
  height: ${topStripHeight};
  left: 0;
  right: 0;
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
  }, [sheet, scaledSpaceToUnitSpace])

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
      const existingRange = existingRangeD.getValue()
      return [
        {
          label: 'Delete focus range',
          callback: () => {
            getStudio()
              .tempTransaction(({stateEditors}) => {
                stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.unset(
                  {
                    ...sheet.address,
                  },
                )
              })
              .commit()
          },
        },
        {
          label: existingRange?.enabled
            ? 'Disable focus range'
            : 'Enable focus range',
          callback: () => {
            if (existingRange !== undefined) {
              getStudio()
                .tempTransaction(({stateEditors}) => {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
                    {
                      ...sheet.address,
                      range: existingRange.range,
                      enabled: !existingRange.enabled,
                    },
                  )
                })
                .commit()
            }
          },
        },
      ]
    },
  })

  const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let startPosBeforeDrag: number,
      endPosBeforeDrag: number,
      tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false
    let createRange = false
    let existingRange: {enabled: boolean; range: IRange<number>} | undefined

    return {
      onDragStart(event) {
        existingRange = existingRangeD.getValue()

        if (event.shiftKey && existingRange === undefined) {
          createRange = true

          const targetElement: HTMLElement = event.target as HTMLElement
          const rect = targetElement!.getBoundingClientRect()
          const tempPos = scaledSpaceToUnitSpace(event.clientX - rect.left)
          if (tempPos <= sequence.length) {
            startPosBeforeDrag = tempPos
            endPosBeforeDrag = startPosBeforeDrag

            getStudio()
              .tempTransaction(({stateEditors}) => {
                stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
                  {
                    ...sheet.address,
                    range: {start: startPosBeforeDrag, end: endPosBeforeDrag},
                    enabled: existingRange?.enabled || true,
                  },
                )
              })
              .commit()
          }
        } else if (existingRange?.enabled === true) {
          startPosBeforeDrag = existingRange.range.start
          endPosBeforeDrag = existingRange.range.end
        }

        if (existingRange?.enabled === true) {
          dragHappened = false
          sequence = val(layoutP.sheet).getSequence()
        }
      },
      onDrag(dx) {
        existingRange = existingRangeD.getValue()
        if (existingRange?.enabled) {
          dragHappened = true
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
                enabled: existingRange?.enabled || true,
              },
            )
          })
        }
      },
      onDragEnd() {
        if (existingRange?.enabled) {
          createRange = false
          if (dragHappened && tempTransaction !== undefined) {
            tempTransaction.commit()
          } else if (tempTransaction) {
            tempTransaction.discard()
          }
          tempTransaction = undefined
        }
      },
      lockCursorTo: 'grabbing',
    }
  }, [sheet, scaledSpaceToUnitSpace])

  useDrag(rangeStripNode, gestureHandlers)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()

    const range = existingRange?.range || {start: 0, end: sequence.length}

    const stripes = `repeating-linear-gradient(
      45deg,
      ${focusRangeTheme.disabled.backgroundColor},
      ${focusRangeTheme.disabled.backgroundColor} 7px,
      rgba(0, 0, 0, 0) 7px,
      rgba(0, 0, 0, 0) 14px
    )`

    let background = 'transparent'

    let cursor = 'default'

    if (existingRange !== undefined) {
      if (existingRange.enabled === true) {
        background = focusRangeTheme.enabled.backgroundColor
        cursor = 'grab'
      } else {
        background = stripes
        cursor = 'default'
      }
    }

    const startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      range.start,
    )

    const endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      range.end,
    )

    return (
      <>
        {contextMenu}
        <RangeStrip
          ref={rangeStripRef as $IntentionalAny}
          onContextMenuCapture={(e) => {
            if (existingRange === undefined) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          style={{
            transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`,
            width: endPosInClippedSpace - startPosInClippedSpace,
            background,
            opacity: existingRange?.enabled
              ? focusRangeTheme.enabled.opacity
              : focusRangeTheme.disabled.opacity,
            cursor: cursor,
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
