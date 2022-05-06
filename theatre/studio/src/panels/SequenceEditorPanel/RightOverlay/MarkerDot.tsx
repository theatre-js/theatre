import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import {
  lockedCursorCssVarName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {
  includeLockFrameStampAttrs,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceMarkerId} from '@theatre/shared/utils/ids'
import type {SheetAddress} from '@theatre/shared/utils/addresses'
import SnapCursor from './SnapCursor.svg'
import MarkerDotVisual from './MarkerDotVisual.svg'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import type {StudioHistoricStateSequenceEditorMarker} from '@theatre/studio/store/types'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import DopeSnap from './DopeSnap'

const MARKER_SIZE_W_PX = 10
const MARKER_SIZE_H_PX = 8
const HIT_ZONE_SIZE_PX = 12
const SNAP_CURSOR_SIZE_PX = 34
const MARKER_HOVER_SIZE_W_PX = MARKER_SIZE_W_PX * 2
const MARKER_HOVER_SIZE_H_PX = MARKER_SIZE_H_PX * 2
const dims = (w: number, h = w) => `
  left: ${w * -0.5}px;
  top: ${h * -0.5}px;
  width: ${w}px;
  height: ${h}px;
`

const MarkerVisualDot = styled.div`
  position: absolute;
  ${dims(MARKER_SIZE_W_PX, MARKER_SIZE_H_PX)}

  background-image: url(${MarkerDotVisual});
  background-size: contain;
  pointer-events: none;
`

const HitZone = styled.div`
  position: absolute;
  ${dims(HIT_ZONE_SIZE_PX)};
  z-index: 1;

  cursor: ew-resize;

  ${pointerEventsAutoInNormalMode};

  // "All instances of this component <Mark/> inside #pointer-root when it has the .draggingPositionInSequenceEditor class"
  // ref: https://styled-components.com/docs/basics#pseudoelements-pseudoselectors-and-nesting
  #pointer-root.draggingPositionInSequenceEditor:not(.draggingMarker) &,
  #pointer-root.draggingPositionInSequenceEditor &.beingDragged {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  #pointer-root.draggingPositionInSequenceEditor:not(.draggingMarker) & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});

    // ⸢⸤⸣⸥ thing
    // This box extends the hitzone so the user does not
    // accidentally leave the hitzone
    &:hover:after {
      position: absolute;
      top: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      left: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      width: ${SNAP_CURSOR_SIZE_PX}px;
      height: ${SNAP_CURSOR_SIZE_PX}px;
      display: block;
      content: ' ';
      background: url(${SnapCursor}) no-repeat 100% 100%;
      // This icon might also fit: GiConvergenceTarget
    }
  }

  &.beingDragged {
    pointer-events: none !important;
  }

  &:hover + ${MarkerVisualDot}, &.beingDragged + ${MarkerVisualDot} {
    ${dims(MARKER_HOVER_SIZE_W_PX, MARKER_HOVER_SIZE_H_PX)}
  }
`
type IMarkerDotProps = {
  layoutP: Pointer<SequenceEditorPanelLayout>
  markerId: SequenceMarkerId
}

const MarkerDot: React.VFC<IMarkerDotProps> = ({layoutP, markerId}) => {
  const sheetAddress = useVal(layoutP.sheet.address)
  const marker = useVal(
    getStudio().atomP.historic.projects.stateByProjectId[sheetAddress.projectId]
      .stateBySheetId[sheetAddress.sheetId].sequenceEditor.markerSet.byId[
      markerId
    ],
  )
  if (!marker) {
    // 1/10 maybe this is normal if React tries to re-render this with
    // out of date data. (e.g. Suspense / Transition stuff?)
    return null
  }

  return <MarkerDotDefined marker={marker} layoutP={layoutP} />
}

export default MarkerDot

type IMarkerDotDefinedProps = {
  layoutP: Pointer<SequenceEditorPanelLayout>
  marker: StudioHistoricStateSequenceEditorMarker
}

const MarkerDotDefined: React.VFC<IMarkerDotDefinedProps> = ({
  layoutP,
  marker,
}) => {
  const sheetAddress = useVal(layoutP.sheet.address)
  const clippedSpaceFromUnitSpace = useVal(layoutP.clippedSpace.fromUnitSpace)

  const [markRef, markNode] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useMarkerContextMenu(markNode, {
    sheetAddress,
    markerId: marker.id,
  })

  const [isDragging] = useDragMarker(markNode, {
    layoutP,
    marker,
  })

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: zIndexes.marker,
        transform: `translateX(${clippedSpaceFromUnitSpace(
          marker.position,
        )}px)`,
        // below the sequence ruler "top bar"
        top: '18px',
      }}
    >
      {contextMenu}
      <HitZone
        ref={markRef}
        // `data-pos` and `includeLockFrameStampAttrs` are used by FrameStampPositionProvider
        // in order to handle snapping the playhead. Adding these props effectively
        // causes the playhead to "snap" to the marker on mouse over.
        // `pointerEventsAutoInNormalMode` and `lockedCursorCssVarName` in the CSS above are also
        // used to make this behave correctly.
        {...includeLockFrameStampAttrs(marker.position)}
        {...DopeSnap.includePositionSnapAttrs(marker.position)}
        className={isDragging ? 'beingDragged' : ''}
      />
      <MarkerVisualDot />
    </div>
  )
}

function useMarkerContextMenu(
  node: HTMLElement | null,
  options: {
    sheetAddress: SheetAddress
    markerId: SequenceMarkerId
  },
) {
  return useContextMenu(node, {
    menuItems() {
      return [
        {
          label: 'Remove marker',
          callback: () => {
            getStudio().transaction(({stateEditors}) => {
              stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.removeMarker(
                {
                  sheetAddress: options.sheetAddress,
                  markerId: options.markerId,
                },
              )
            })
          },
        },
      ]
    },
  })
}

function useDragMarker(
  node: HTMLDivElement | null,
  props: {
    layoutP: Pointer<SequenceEditorPanelLayout>
    marker: StudioHistoricStateSequenceEditorMarker
  },
): [isDragging: boolean] {
  const propsRef = useRef(props)
  propsRef.current = props

  const useDragOpts = useMemo<UseDragOpts>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let markerAtStartOfDrag: StudioHistoricStateSequenceEditorMarker

    return {
      debugName: `MarkerDot/useDragMarker (${props.marker.id})`,

      onDragStart(_event) {
        markerAtStartOfDrag = propsRef.current.marker
        toUnitSpace = val(props.layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, _dy, event) {
        const original = markerAtStartOfDrag
        const newPosition = Math.max(
          // check if our event hoversover a [data-pos] element
          DopeSnap.checkIfMouseEventSnapToPos(event, {
            ignore: node,
          }) ??
            // if we don't find snapping target, check the distance dragged + original position
            original.position + toUnitSpace(dx),
          // sanitize to minimum of zero
          0,
        )

        tempTransaction?.discard()
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.replaceMarkers(
            {
              sheetAddress: val(props.layoutP.sheet.address),
              markers: [{...original, position: newPosition}],
              snappingFunction: val(props.layoutP.sheet).getSequence()
                .closestGridPosition,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        if (dragHappened) tempTransaction?.commit()
        else tempTransaction?.discard()
        tempTransaction = undefined
      },
    }
  }, [])

  const [isDragging] = useDrag(node, useDragOpts)

  useLockFrameStampPosition(isDragging, props.marker.position)
  useCssCursorLock(
    isDragging,
    'draggingPositionInSequenceEditor draggingMarker',
    'ew-resize',
  )

  return [isDragging]
}
