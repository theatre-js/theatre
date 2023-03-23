import React from 'react'
import {val} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {
  Circle,
  DataViewerContainer,
  Polygon,
  Rect,
  SVGContainer,
} from './components'

// Types

export type DataViewerInfo = {
  time: number
  duration: number
  value: number
}

export type DataViewerTime = {
  time: number
  value: number
}

export type DataViewerType = 'Data' | 'Time'

// Generate SVGs

function generateDataSVG(
  data: Array<DataViewerInfo>,
  scale: number,
  dataH: number,
) {
  return (
    <>
      <g>
        {data.map((item: DataViewerInfo) => {
          return (
            <Rect
              x={item.time * scale}
              y={(1 - item.value) * dataH}
              width={item.duration * scale}
              height={item.value * dataH}
            />
          )
        })}
      </g>
    </>
  )
}

function generateTimeSVG(
  data: Array<DataViewerTime>,
  scale: number,
  dataW: number,
  dataH: number,
) {
  let pts = `0,${dataH}`
  let ptData: Array<number[]> = []
  for (let i = 0; i < data.length; i++) {
    const x = Math.round(data[i].time * scale)
    const y = Math.round((1 - data[i].value) * dataH)
    pts += ` ${x},${y}`
    ptData.push([x, y])
  }
  pts += ` ${dataW},${dataH}`
  return (
    <>
      <Polygon points={pts} />
      <g>
        {ptData.map((value: number[]) => {
          return <Circle cx={value[0]} cy={value[1]} />
        })}
      </g>
    </>
  )
}

// Component

export const DataViewer: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const data = val(layoutP.data)
  const dataType = val(layoutP.dataType)
  if (data === undefined || dataType === undefined) return null

  const sheet = val(layoutP.sheet)
  const sequence = sheet.getSequence()
  const duration = sequence.length
  const scale = val(layoutP.scaledSpace.fromUnitSpace)(1)
  const dataW = scale * duration
  const dataH = val(layoutP.rightDims.height) - 30
  const svg =
    dataType === 'Data'
      ? generateDataSVG(data as Array<DataViewerInfo>, scale, dataH)
      : generateTimeSVG(data as Array<DataViewerTime>, scale, dataW, dataH)
  return (
    <DataViewerContainer
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
