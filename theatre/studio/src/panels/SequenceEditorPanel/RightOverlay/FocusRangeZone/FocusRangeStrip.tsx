import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

export const focusRangeStripTheme = {
  enabled: {
    backgroundColor: '#2C2F34',
    stroke: '#646568',
  },
  disabled: {
    backgroundColor: '#282a2cc5',
    stroke: '#595a5d',
  },
  hover: {
    backgroundColor: '#34373D',
    stroke: '#C8CAC0',
  },
  dragging: {
    backgroundColor: '#3F444A',
    stroke: '#C8CAC0',
  },
  thumbWidth: 9,
  hitZoneWidth: 26,
  rangeStripMinWidth: 30,
}

const stripWidth = 1000

export const RangeStrip = styled.div<{enabled: boolean}>`
  position: absolute;
  height: ${() => topStripHeight - 1}px;
  background-color: ${(props) =>
    props.enabled
      ? focusRangeStripTheme.enabled.backgroundColor
      : focusRangeStripTheme.disabled.backgroundColor};
  cursor: grab;
  top: 0;
  left: 0;
  width: ${stripWidth}px;
  transform-origin: left top;
  &:hover {
    background-color: ${focusRangeStripTheme.hover.backgroundColor};
  }
  &.dragging {
    background-color: ${focusRangeStripTheme.dragging.backgroundColor};
    cursor: grabbing !important;
  }
  ${pointerEventsAutoInNormalMode};

  /* covers the one pixel space between the focus range strip and the top strip
  of the sequence editor panel, which would have caused that one pixel to act
  like a panel drag zone */
  &:after {
    display: block;
    content: ' ';
    position: absolute;
    bottom: -1px;
    height: 1px;
    left: 0;
    right: 0;
    background: transparent;
    pointer-events: normal;
    z-index: -1;
  }
`

/**
 * Clamps the lower and upper bounds of a range to the lower and upper bounds of the reference range, while maintaining the original width of the range. If the range to be clamped has a greater width than the reference range, then the reference range is returned.
 *
 * @param range - The range bounds to be clamped
 * @param referenceRange - The reference range
 *
 * @returns The clamped bounds.
 *
 * @example
 * ```ts
 * clampRange([-1, 4], [2, 3]) // returns [2, 3]
 * clampRange([-1, 2.5], [2, 3]) // returns [2, 2.5]
 * ```
 */
function clampRange(
  range: [number, number],
  referenceRange: [number, number],
): [number, number] {
  let overflow = 0

  const [start, end] = range
  const [lower, upper] = referenceRange

  if (end - start > upper - lower) return [lower, upper]

  if (start < lower) {
    overflow = 0 - start
  }

  if (end > upper) {
    overflow = upper - end
  }

  return [start + overflow, end + overflow]
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

  const [rangeStripRef, rangeStripNode] = useRefAndState<HTMLElement | null>(
    null,
  )

  const [contextMenu] = useContextMenu(rangeStripNode, {
    menuItems: () => {
      const sheet = val(layoutP.sheet)
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

  const scaledSpaceToUnitSpace = useVal(layoutP.scaledSpace.toUnitSpace)
  const sheet = useVal(layoutP.sheet)

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let newStartPosition: number, newEndPosition: number

    return {
      debugName: 'FocusRangeStrip',
      onDragStart(event) {
        let tempTransaction: CommitOrDiscard | undefined
        let existingRange = existingRangeD.getValue()
        if (!existingRange) return false

        const startPosBeforeDrag = existingRange.range.start
        const endPosBeforeDrag = existingRange.range.end
        let dragHappened = false
        const sequence = val(layoutP.sheet).getSequence()

        return {
          onDrag(dx) {
            existingRange = existingRangeD.getValue()
            if (existingRange) {
              dragHappened = true
              const deltaPos = scaledSpaceToUnitSpace(dx)

              const start = startPosBeforeDrag + deltaPos
              let end = endPosBeforeDrag + deltaPos

              if (end < start) {
                end = start
              }

              ;[newStartPosition, newEndPosition] = clampRange(
                [start, end],
                [0, sequence.length],
              ).map((pos) => sequence.closestGridPosition(pos))

              if (tempTransaction) {
                tempTransaction.discard()
              }

              tempTransaction = getStudio().tempTransaction(
                ({stateEditors}) => {
                  stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
                    {
                      ...sheet.address,
                      range: {
                        start: newStartPosition,
                        end: newEndPosition,
                      },
                      enabled: existingRange?.enabled ?? true,
                    },
                  )
                },
              )
            }
          },
          onDragEnd() {
            if (existingRange) {
              if (dragHappened && tempTransaction !== undefined) {
                tempTransaction.commit()
              } else if (tempTransaction) {
                tempTransaction.discard()
              }
            }
          },
        }
      },

      lockCSSCursorTo: 'grabbing',
    }
  }, [sheet, scaledSpaceToUnitSpace])

  const [isDragging] = useDrag(rangeStripNode, gestureHandlers)

  useLockFrameStampPosition(isDragging, -1)

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()

    const range = existingRange?.range || {start: 0, end: 0}
    let startX = val(layoutP.clippedSpace.fromUnitSpace)(range.start)
    let endX = val(layoutP.clippedSpace.fromUnitSpace)(range.end)
    let scaleX: number, translateX: number

    if (startX < 0) {
      startX = 0
    }

    if (endX > val(layoutP.clippedSpace.width)) {
      endX = val(layoutP.clippedSpace.width)
    }

    if (startX > endX) {
      translateX = 0
      scaleX = 0
    } else {
      translateX = startX
      scaleX = (endX - startX) / stripWidth
    }

    if (!existingRange) return <></>

    return (
      <>
        {contextMenu}
        <RangeStrip
          id="range-strip"
          enabled={existingRange.enabled}
          className={`${isDragging ? 'dragging' : ''} ${
            existingRange.enabled ? 'enabled' : ''
          }`}
          ref={rangeStripRef as $IntentionalAny}
          style={{
            transform: `translateX(${translateX}px) scale(${scaleX}, 1)`,
          }}
        />
      </>
    )
  }, [layoutP, rangeStripRef, existingRangeD, contextMenu, isDragging])
}

export default FocusRangeStrip
