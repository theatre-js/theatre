import React from 'react'
import {Circle, Polygon, Rect} from './components'
import type {SequenceDataItem} from './types'

/**
 * A block of data
 */
export function generateSVGData(
  data: SequenceDataItem[],
  scale: number,
  dataH: number,
) {
  return (
    <g>
      {data.map((item: SequenceDataItem) => {
        const duration = item.duration !== undefined ? item.duration : 0
        return (
          <Rect
            x={item.position * scale}
            y={(1 - item.value) * dataH}
            width={duration * scale}
            height={item.value * dataH}
            key={Math.random()}
          />
        )
      })}
    </g>
  )
}

/**
 * 1 point in time of data
 */
export function generateSVGTime(
  data: SequenceDataItem[],
  scale: number,
  dataW: number,
  dataH: number,
) {
  let pts = `0,${dataH}`
  let ptData: Array<number[]> = []
  for (let i = 0; i < data.length; i++) {
    const x = Math.round(data[i].position * scale)
    const y = Math.round((1 - data[i].value) * dataH)
    pts += ` ${x},${y}`
    ptData.push([x, y])
  }
  const lastPt = ptData[ptData.length - 1]
  if (lastPt[1] > 0) {
    pts += ` ${lastPt[0]},${dataH}`
  }
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
