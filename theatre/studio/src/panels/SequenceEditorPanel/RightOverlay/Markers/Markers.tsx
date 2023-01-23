import type {Pointer} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import MarkerDot from './MarkerDot'

const Markers: React.VFC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const sheetAddress = useVal(layoutP.sheet.address)
  const markerSetP =
    getStudio().atomP.historic.projects.stateByProjectId[sheetAddress.projectId]
      .stateBySheetId[sheetAddress.sheetId].sequenceEditor.markerSet
  const markerAllIds = useVal(markerSetP.allIds)

  return (
    <>
      {markerAllIds &&
        Object.keys(markerAllIds).map((markerId) => (
          <MarkerDot key={markerId} layoutP={layoutP} markerId={markerId} />
        ))}
    </>
  )
}

export default Markers
