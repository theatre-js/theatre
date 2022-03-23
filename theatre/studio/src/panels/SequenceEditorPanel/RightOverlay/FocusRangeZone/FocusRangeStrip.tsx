import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny, IRange} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo, useState} from 'react'
import styled from 'styled-components'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'

export const focusRangeTheme = {
  enabled: {
    backgroundColor: '#2C2F34',
    opacity: 1,
    stroke: '#646568',
  },
  disabled: {
    backgroundColor: '#282A2C',
    opacity: 1,
    stroke: '#3C3D3D',
  },
  playing: {
    backgroundColor: 'red',
    stroke: '#646568',
    opacity: 1,
  },
  highlight: {
    backgroundColor: '#34373D',
    stroke: '#C8CAC0',
    opacity: 1,
  },
  dragging: {
    backgroundColor: '#3F444A',
  },
  thumbWidth: 9,
  hitZoneWidth: 26,
  rangeStripMinWidth: 30,
}

const stripWidth = 1000

const RangeStrip = styled.div`
  position: absolute;
  height: ${() => topStripHeight};
  opacity: ${focusRangeTheme.enabled.opacity};
  background-color: ${focusRangeTheme.enabled.backgroundColor};
  top: 0;
  left: 0;
  width: ${stripWidth}px;
  transform-origin: left top;
  &:hover {
    background-color: ${focusRangeTheme.highlight.backgroundColor};
  }
  &.dragging {
    background-color: ${focusRangeTheme.dragging.backgroundColor};
    cursor: grabbing !important;
  }
  ${pointerEventsAutoInNormalMode};
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

  const sheet = val(layoutP.sheet)

  const [rangeStripRef, rangeStripNode] = useRefAndState<HTMLElement | null>(
    null,
  )

  const [previousRangeState, setPreviousRangeState] = useState<null | {
    start: number
    end: number
  }>(null)

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
    let sequence = sheet.getSequence()
    let startPosBeforeDrag: number,
      endPosBeforeDrag: number,
      tempTransaction: CommitOrDiscard | undefined
    let dragHappened = false
    let existingRange: {enabled: boolean; range: IRange<number>} | undefined
    let target: HTMLDivElement | undefined
    let newStartPosition: number, newEndPosition: number

    return {
      onDragStart(event) {
        existingRange = existingRangeD.getValue()

        if (existingRange?.enabled === true) {
          startPosBeforeDrag = existingRange.range.start
          endPosBeforeDrag = existingRange.range.end
          dragHappened = false
          sequence = val(layoutP.sheet).getSequence()
          target = event.target as HTMLDivElement
          target.classList.add('dragging')
        }
      },
      onDrag(dx) {
        existingRange = existingRangeD.getValue()
        if (existingRange?.enabled) {
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
          if (dragHappened && tempTransaction !== undefined) {
            tempTransaction.commit()
            setPreviousRangeState({
              start: newStartPosition,
              end: newEndPosition,
            })
          } else if (tempTransaction) {
            tempTransaction.discard()
          }
          tempTransaction = undefined
        }
        if (target !== undefined) {
          // target.style.backgroundColor = focusRangeTheme.enabled.backgroundColor
          target.classList.remove('dragging')
          target = undefined
        }
      },
      lockCursorTo: 'grabbing',
    }
  }, [sheet, scaledSpaceToUnitSpace])

  useDrag(rangeStripNode, gestureHandlers)

  const handleDoubleClick = useMemo(
    (): (() => void) => (): void => {
      const existingRange = existingRangeD.getValue()

      if (existingRange) {
        const sheet = val(layoutP.sheet)
        let sequence = sheet.getSequence()

        let newRange: {start: number; end: number}

        if (previousRangeState === null) {
          newRange = {start: 0, end: sequence.length}
          setPreviousRangeState(existingRange.range)
        } else {
          newRange = previousRangeState
          setPreviousRangeState(null)
        }

        const tempTransaction = getStudio().tempTransaction(
          ({stateEditors}) => {
            stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
              {
                ...sheet.address,
                range: newRange,
                enabled: true,
              },
            )
          },
        )

        tempTransaction.commit()
      }
    },
    [existingRangeD, layoutP, previousRangeState],
  )

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

    let conditionalStyleProps: {
      background?: string
      cursor?: string
    } = {}

    if (existingRange !== undefined) {
      if (existingRange.enabled === false) {
        conditionalStyleProps.background =
          focusRangeTheme.disabled.backgroundColor
        conditionalStyleProps.cursor = 'default'
      } else {
        conditionalStyleProps.cursor = 'grab'
      }
    }

    return existingRange === undefined ? (
      <></>
    ) : (
      <>
        {contextMenu}
        <RangeStrip
          id="range-strip"
          ref={rangeStripRef as $IntentionalAny}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translateX(${translateX}px) scale(${scaleX}, 1)`,
            opacity: existingRange.enabled
              ? focusRangeTheme.enabled.opacity
              : focusRangeTheme.disabled.opacity,
            ...conditionalStyleProps,
          }}
        />
      </>
    )
  }, [layoutP, rangeStripRef, existingRangeD, contextMenu, previousRangeState])
}

export default FocusRangeStrip
