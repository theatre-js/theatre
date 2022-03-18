import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import type {$IntentionalAny, IRange, VoidFn} from '@theatre/shared/utils/types'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {getPlaybackStateBox} from '@theatre/studio/UIRoot/useKeyboardShortcuts'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {clamp} from 'lodash-es'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {
  usePanel,
  panelDimsToPanelPosition,
} from '@theatre/studio/panels/BasePanel/BasePanel'
import type Sequence from '@theatre/core/sequences/Sequence'
import type Sheet from '@theatre/core/sheets/Sheet'

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
  height: 5,
  thumbWidth: 9,
}

const topStripHeight = 18
const hitZoneSize = topStripHeight * 1.5
const dims = (size: number) => `
  left: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const Handler = styled.div`
  content: ' ';
  width: ${focusRangeTheme.thumbWidth};
  height: 100%;
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  stroke: ${focusRangeTheme.enabled.stroke};
`

const HitZone = styled.div`
  position: absolute;
  z-index: 1;
  ${dims(hitZoneSize)}
`

const RangeStrip = styled.div`
  position: absolute;
  height: 100%;
  opacity: ${focusRangeTheme.enabled.opacity};
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

const FocusRangeZone: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const [containerRef, containerNode] = useRefAndState<HTMLElement | null>(null)

  const sheet = useVal(layoutP.sheet)
  let sequence = sheet.getSequence()

  const panelStuff = usePanel()
  const panelStuffRef = useRef(panelStuff)
  panelStuffRef.current = panelStuff

  const playbackStateBox = getPlaybackStateBox(sequence)
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

  useDrag(
    containerNode,
    usePanelDragZoneGestureHandlers(layoutP, panelStuffRef),
  )

  const [onMouseEnter, onMouseLeave] = useMemo(() => {
    let unlock: VoidFn | undefined
    return [
      function onMouseEnter(event: React.MouseEvent) {
        if (event.shiftKey === false) {
          if (unlock) {
            const u = unlock
            unlock = undefined
            u()
          }
          unlock = panelStuffRef.current.addBoundsHighlightLock()
        }
      },
      function onMouseLeave(event: React.MouseEvent) {
        if (event.shiftKey === false) {
          if (unlock) {
            const u = unlock
            unlock = undefined
            u()
          }
        }
      },
    ]
  }, [])

  return usePrism(() => {
    const existingRange = existingRangeD.getValue()
    const playing = playbackStateBox.derivation.getValue()

    let isPlayingInFocusRange = false

    if (
      playing &&
      existingRange &&
      sequence.position >= existingRange.range.start &&
      sequence.position <= existingRange.range.end
    ) {
      isPlayingInFocusRange = true
    }

    const endPos = val(layoutP.clippedSpace.fromUnitSpace)(sequence.length)

    return (
      <Container
        className="focusContainer-2"
        ref={containerRef as $IntentionalAny}
        style={{
          width: `${endPos}px`,
          // background: 'black',
          left: 0,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <FocusRangeStrip
          layoutP={layoutP}
          isPlayingInFocusRange={isPlayingInFocusRange}
        />
        <FocusRangeThumb
          thumbType="start"
          layoutP={layoutP}
          isPlayingInFocusRange={isPlayingInFocusRange}
        />
        <FocusRangeThumb
          thumbType="end"
          layoutP={layoutP}
          isPlayingInFocusRange={isPlayingInFocusRange}
        />
      </Container>
    )
  }, [layoutP, existingRangeD, playbackStateBox, sequence])
}

export default FocusRangeZone

function usePanelDragZoneGestureHandlers(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  panelStuffRef: React.MutableRefObject<ReturnType<typeof usePanel>>,
) {
  return useMemo((): Parameters<typeof useDrag>[1] => {
    const focusRangeCreationGestureHandlers = (): Parameters<
      typeof useDrag
    >[1] => {
      let startPosBeforeDrag: number,
        endPosBeforeDrag: number,
        tempTransaction: CommitOrDiscard | undefined

      let dragHappened = false
      let scaledSpaceToUnitSpace: (s: number) => number
      let sequence: Sequence
      let sheet: Sheet

      return {
        onDragStart(event) {
          scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
          sheet = val(layoutP.sheet)
          sequence = sheet.getSequence()

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
                    enabled: true,
                  },
                )
              })
              .commit()
          }
        },
        onDrag(dx) {
          dragHappened = true
          const deltaPos = scaledSpaceToUnitSpace(dx)

          let newStartPosition: number, newEndPosition: number

          const start = startPosBeforeDrag
          let end = endPosBeforeDrag + deltaPos

          if (end < start) {
            end = start
          }

          ;[newStartPosition, newEndPosition] = [
            start,
            clamp(end, start, sequence.length),
          ].map((pos) => sequence.closestGridPosition(pos))

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
                enabled: true,
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
        lockCursorTo: 'grabbing',
      }
    }

    const panelMoveGestureHandlers = (): Parameters<typeof useDrag>[1] => {
      let stuffBeforeDrag = panelStuffRef.current
      let tempTransaction: CommitOrDiscard | undefined
      let unlock: VoidFn | undefined
      return {
        onDragStart() {
          stuffBeforeDrag = panelStuffRef.current
          if (unlock) {
            const u = unlock
            unlock = undefined
            u()
          }
          unlock = panelStuffRef.current.addBoundsHighlightLock()
        },
        onDrag(dx, dy) {
          const newDims: typeof panelStuffRef.current['dims'] = {
            ...stuffBeforeDrag.dims,
            top: stuffBeforeDrag.dims.top + dy,
            left: stuffBeforeDrag.dims.left + dx,
          }
          const position = panelDimsToPanelPosition(newDims, {
            width: window.innerWidth,
            height: window.innerHeight,
          })

          tempTransaction?.discard()
          tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
            stateEditors.studio.historic.panelPositions.setPanelPosition({
              position,
              panelId: stuffBeforeDrag.panelId,
            })
          })
        },
        onDragEnd(dragHappened) {
          if (unlock) {
            const u = unlock
            unlock = undefined
            u()
          }
          if (dragHappened) {
            tempTransaction?.commit()
          } else {
            tempTransaction?.discard()
          }
          tempTransaction = undefined
        },
        lockCursorTo: 'move',
      }
    }

    let currentGestureHandlers: undefined | Parameters<typeof useDrag>[1]

    return {
      onDragStart(event) {
        if (event.shiftKey) {
          currentGestureHandlers = focusRangeCreationGestureHandlers()
        } else {
          currentGestureHandlers = panelMoveGestureHandlers()
        }
        currentGestureHandlers.onDragStart!(event)
      },
      onDrag(dx, dy, event) {
        if (!currentGestureHandlers) {
          console.error('oh hno')
        }
        currentGestureHandlers!.onDrag(dx, dy, event)
      },
      onDragEnd(dragHappened) {
        currentGestureHandlers!.onDragEnd!(dragHappened)
      },
      lockCursorTo: 'grabbing',
    }
  }, [layoutP, panelStuffRef])
}
