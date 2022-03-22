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

export const focusRangeTheme = {
  enabled: {
    backgroundColor: '#33373D',
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
    backgroundColor: '#575C66',
    stroke: '#C8CAC0',
    opacity: 1,
  },
  dragging: {
    backgroundColor: '#212221',
  },
  thumbWidth: 9,
  hitZoneWidth: 26,
  rangeStripMinWidth: 30,
}

const RangeStrip = styled.div`
  position: absolute;
  height: 100%;
  opacity: ${focusRangeTheme.enabled.opacity};
  ${pointerEventsAutoInNormalMode};
  &:hover {
    background-color: ${focusRangeTheme.highlight.backgroundColor}!important;
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
  isPlayingInFocusRange: boolean
}> = ({layoutP, isPlayingInFocusRange}) => {
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
          target.style.backgroundColor =
            focusRangeTheme.dragging.backgroundColor
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
          target.style.backgroundColor = focusRangeTheme.enabled.backgroundColor
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

    let background = 'transparent'

    let cursor = 'default'

    if (existingRange !== undefined) {
      if (existingRange.enabled === true) {
        background = isPlayingInFocusRange
          ? focusRangeTheme.playing.backgroundColor
          : focusRangeTheme.enabled.backgroundColor
        cursor = 'grab'
      } else {
        background = focusRangeTheme.disabled.backgroundColor
        cursor = 'default'
      }
    }

    let startPosInClippedSpace: number,
      endPosInClippedSpace: number,
      conditionalStyleProps: {width: number; transform: string} | undefined

    if (existingRange !== undefined) {
      startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
        range.start,
      )

      endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(range.end)
      conditionalStyleProps = {
        width: endPosInClippedSpace - startPosInClippedSpace,
        transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`,
      }
    }

    return existingRange === undefined ? (
      <></>
    ) : (
      <>
        {contextMenu}
        <RangeStrip
          ref={rangeStripRef as $IntentionalAny}
          onDoubleClick={handleDoubleClick}
          style={{
            background,
            opacity: existingRange.enabled
              ? focusRangeTheme.enabled.opacity
              : focusRangeTheme.disabled.opacity,
            cursor: cursor,
            ...conditionalStyleProps,
          }}
        />
      </>
    )
  }, [
    layoutP,
    rangeStripRef,
    existingRangeD,
    contextMenu,
    isPlayingInFocusRange,
    previousRangeState,
  ])
}

export default FocusRangeStrip
