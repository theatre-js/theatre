import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
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
import FocusRangeThumb from './FocusRangeThumb'
import FocusRangeStrip from './FocusRangeStrip'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'

const Container = styled.div`
  position: absolute;
  height: ${() => topStripHeight};
  left: 0;
  right: 0;
  box-sizing: border-box;
  overflow: hidden;
`

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
