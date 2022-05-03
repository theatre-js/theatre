import type {Pointer} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import Marker from './Marker'

const Container = styled.div`
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 40px;
  overflow: hidden;
`

const Markers: React.VFC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const sheetAddress = useVal(layoutP.sheet.address)
  const markers = useVal(
    getStudio().atomP.historic.projects.stateByProjectId[sheetAddress.projectId]
      .stateBySheetId[sheetAddress.sheetId].sequenceEditor.markers,
  )

  return (
    <Container>
      {markers?.map((marker) => (
        // TODO: use marker.id
        <Marker
          key={marker.position}
          layoutP={layoutP}
          marker={marker}
        ></Marker>
      ))}
    </Container>
  )
}

export default Markers
