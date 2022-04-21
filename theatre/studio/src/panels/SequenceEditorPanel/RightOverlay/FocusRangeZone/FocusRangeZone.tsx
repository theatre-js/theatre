import type Sequence from '@theatre/core/sequences/Sequence'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import {
  panelDimsToPanelPosition,
  usePanel,
} from '@theatre/studio/panels/BasePanel/BasePanel'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {clamp} from 'lodash-es'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import FocusRangeStrip, {focusRangeStripTheme} from './FocusRangeStrip'
import FocusRangeThumb from './FocusRangeThumb'

const Container = styled.div`
  position: absolute;
  height: ${() => topStripHeight}px;
  left: 0;
  right: 0;
  box-sizing: border-box;
`

const FocusRangeZone: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const [containerRef, containerNode] = useRefAndState<HTMLElement | null>(null)

  const panelStuff = usePanel()
  const panelStuffRef = useRef(panelStuff)
  panelStuffRef.current = panelStuff

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
    return (
      <Container
        ref={containerRef as $IntentionalAny}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <FocusRangeStrip layoutP={layoutP} />
        <FocusRangeThumb thumbType="start" layoutP={layoutP} />
        <FocusRangeThumb thumbType="end" layoutP={layoutP} />
      </Container>
    )
  }, [layoutP, existingRangeD])
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
      let startPosInUnitSpace: number,
        tempTransaction: CommitOrDiscard | undefined

      let clippedSpaceToUnitSpace: (s: number) => number
      let scaledSpaceToUnitSpace: (s: number) => number
      let sequence: Sequence
      let sheet: Sheet
      let minFocusRangeStripWidth: number

      return {
        debugName: 'FocusRangeZone/focusRangeCreationGestureHandlers',
        onDragStart(event) {
          clippedSpaceToUnitSpace = val(layoutP.clippedSpace.toUnitSpace)
          scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
          sheet = val(layoutP.sheet)
          sequence = sheet.getSequence()

          const targetElement: HTMLElement = event.target as HTMLElement
          const rect = targetElement!.getBoundingClientRect()
          startPosInUnitSpace = clippedSpaceToUnitSpace(
            event.clientX - rect.left,
          )
          minFocusRangeStripWidth = scaledSpaceToUnitSpace(
            focusRangeStripTheme.rangeStripMinWidth,
          )
        },
        onDrag(dx) {
          const deltaPos = scaledSpaceToUnitSpace(dx)

          let start = startPosInUnitSpace
          let end = startPosInUnitSpace + deltaPos

          ;[start, end] = [
            clamp(start, 0, sequence.length),
            clamp(end, 0, sequence.length),
          ].map((pos) => sequence.closestGridPosition(pos))

          if (end < start) {
            ;[start, end] = [
              Math.max(Math.min(end, start - minFocusRangeStripWidth), 0),
              start,
            ]
          } else if (dx > 0) {
            end = Math.min(
              Math.max(end, start + minFocusRangeStripWidth),
              sequence.length,
            )
          }

          if (tempTransaction) {
            tempTransaction.discard()
          }

          tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
            stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.focusRange.set(
              {
                ...sheet.address,
                range: {start, end},
                enabled: true,
              },
            )
          })
        },
        onDragEnd(dragHappened) {
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
        debugName: 'FocusRangeZone/panelMoveGestureHandlers',
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
      debugName: 'FocusRangeZone',
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
          console.error('oh no')
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
