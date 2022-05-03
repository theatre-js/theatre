import type {Pointer} from '@theatre/dataverse'
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
import type {StudioHistoricStateSequenceEditorMarker} from '@theatre/studio/store/types'

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
  marker: StudioHistoricStateSequenceEditorMarker
}> = ({layoutP, marker}) => {
  const layout = useVal(layoutP)
  const clippedSpaceFromUnitSpace = layout.clippedSpace.fromUnitSpace

  const [markRef, markNode] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useMarkerContextMenu(markNode, {layout, marker})
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
    layout: SequenceEditorPanelLayout
    marker: StudioHistoricStateSequenceEditorMarker
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
                  sheetAddress: options.layout.sheet.address,
                  markerAt: {position: options.marker.position},
                },
              )
            })
          },
        },
      ]
    },
  })
}
