import React from 'react'
import {val} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import getStudio from '@theatre/studio/getStudio'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {DataViewerContainer, SVGContainer} from './components'
import {generateSVGData, generateSVGTime} from './svg'

// Component

export const DataViewer: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const sheet = val(layoutP.sheet)
  const sequence = sheet.getSequence()
  const duration = sequence.length
  const scale = val(layoutP.scaledSpace.fromUnitSpace)(1)
  const dataW = scale * duration
  const dataH = val(layoutP.rightDims.height) - 30
  let svg = undefined

  const dataSet =
    getStudio().atomP.historic.projects.stateByProjectId[
      sheet.address.projectId
    ].stateBySheetId[sheet.address.sheetId].sequenceEditor.dataSet
  const sequenceData = val(dataSet)
  if (sequenceData !== undefined) {
    if (sequenceData.data !== undefined && sequenceData.data.length > 0) {
      if (sequenceData.type === 'Time') {
        svg = generateSVGTime(sequenceData.data, scale, dataW, dataH)
      } else {
        svg = generateSVGData(sequenceData.data, scale, dataH)
      }
    }
  }

  return (
    <DataViewerContainer
      id="sequenceData"
      style={{
        width: `${dataW}px`,
        height: `${dataH}px`,
        top: `${val(layoutP.graphEditorDims.padding.top)}px`,
      }}
    >
      <SVGContainer viewBox={`0 0 ${dataW} ${dataH}`}>{svg}</SVGContainer>
    </DataViewerContainer>
  )
}
