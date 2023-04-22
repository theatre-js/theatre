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
              key={Math.random()}
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
          return <Circle cx={value[0]} cy={value[1]} key={Math.random()} />
        })}
      </g>
    </>
  )
}

// Component

export const DataViewer: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  // const data = val(layoutP.data)
  // const dataType = val(layoutP.dataType)
  // if (data === undefined || dataType === undefined) return null
  const data: Array<DataViewerInfo> = [
    {
      time: 0,
      duration: 6.58159,
      value: 1,
    },
    {
      time: 6.58159,
      duration: 25.00367,
      value: 0.804,
    },
    {
      time: 31.58526,
      duration: 11.92991,
      value: 0.555,
    },
    {
      time: 43.51517,
      duration: 23.06711,
      value: 0.654,
    },
    {
      time: 66.58228,
      duration: 26.9593,
      value: 0.771,
    },
    {
      time: 93.54158,
      duration: 9.16508,
      value: 1,
    },
  ]
  const dataType = 'Data'

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
  console.log('DataViewer')
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
