import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import {lockedCursorCssVarName} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React from 'react'
import styled from 'styled-components'
import {attributeNameThatLocksFramestamp} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceMarkerId} from '@theatre/shared/utils/ids'
import type {SheetAddress} from '@theatre/shared/utils/addresses'

const MarkerDot = styled.div`
  position: absolute;
  height: 20px;
  width: 8px;
  background-color: white;
  z-index: 1;
  color: black;
  overflow: hidden;
  font-size: 10px;

  ${pointerEventsAutoInNormalMode};

  // "All instances of this component <Mark/> inside #pointer-root when it has the .draggingPositionInSequenceEditor class"
  // ref: https://styled-components.com/docs/basics#pseudoelements-pseudoselectors-and-nesting
  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  &:hover {
    background-color: red;
  }
`

const Marker: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  markerId: SequenceMarkerId
}> = ({layoutP, markerId}) => {
  const sheetAddress = val(layoutP.sheet.address)
  const marker = useVal(
    getStudio().atomP.historic.projects.stateByProjectId[sheetAddress.projectId]
      .stateBySheetId[sheetAddress.sheetId].sequenceEditor.markerSet.byId[
      markerId
    ],
  )

  const clippedSpaceFromUnitSpace = useVal(layoutP.clippedSpace.fromUnitSpace)

  const [markRef, markNode] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useMarkerContextMenu(markNode, {sheetAddress, markerId})

  if (!marker) {
    // 1/10 maybe this is normal if React tries to re-render this with
    // out of date data. (e.g. Suspense / Transition stuff?)
    return null
  }

  return (
    <>
      {contextMenu}
      <MarkerDot
        ref={markRef}
        // `data-pos` and `attributeNameThatLocksFramestamp` are used by FrameStampPositionProvider
        // in order to handle snapping the playhead. Adding these props effectively
        // causes the playhead to "snap" to the marker on mouse over.
        // `pointerEventsAutoInNormalMode` and `lockedCursorCssVarName` in the CSS above are also
        // used to make this behave correctly.
        {...{[attributeNameThatLocksFramestamp]: marker.position.toFixed(3)}}
        data-pos={marker.position.toFixed(3)}
        style={{
          transform: `translateX(${clippedSpaceFromUnitSpace(
            marker.position,
          )}px)`,
        }}
      />
    </>
  )
}

export default Marker

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
