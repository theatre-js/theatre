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
import React, {useMemo} from 'react'
import styled from 'styled-components'

export const focusRangeTheme = {
  enabled: {
    backgroundColor: '#33373D',
    opacity: 1,
    stroke: '#646568',
  },
  disabled: {
    backgroundColor: '#282A2C',
    // backgroundColor: '#212221',
    opacity: 1,
    stroke: '#3C3D3D',
  },
  playing: {
    backgroundColor: 'red',
    stroke: '#646568',
    opacity: 1,
  },
  thumbWidth: 9,
}

const RangeStrip = styled.div`
  position: absolute;
  height: 100%;
  opacity: ${focusRangeTheme.enabled.opacity};
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

    return {
      onDragStart() {
        existingRange = existingRangeD.getValue()

        if (existingRange?.enabled === true) {
          startPosBeforeDrag = existingRange.range.start
          endPosBeforeDrag = existingRange.range.end
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
  ])
}

export default FocusRangeStrip
