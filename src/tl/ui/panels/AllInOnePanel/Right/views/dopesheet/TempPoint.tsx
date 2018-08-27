import React from 'react'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import {TColor} from '$tl/ui/panels/AllInOnePanel/Right/types'

interface IProps {
  color: TColor
  pointTime: number
  pointConnected: boolean
  nextPointTime?: number
  prevPointTime?: number
  prevPointConnected?: boolean
}

export default ({
  color,
  pointTime,
  pointConnected,
  nextPointTime,
  prevPointTime,
  prevPointConnected = false,
}: IProps) => {
  return (
    <g>
      {prevPointConnected && (
        <>
          <LineConnectorRect
            x={prevPointTime!}
            y={50}
            width={pointTime - prevPointTime!}
            color={color.darkened}
          />
          <PointCircle x={prevPointTime!} y={50} />
        </>
      )}
      {pointConnected && (
        <LineConnectorRect
          x={pointTime}
          y={50}
          width={nextPointTime! - pointTime}
          color={color.darkened}
        />
      )}
      <TempPointCircle color={color} x={pointTime} />
    </g>
  )
}

export const TempPointCircle = ({
  color,
  x,
}: {
  color: TColor
  x: number
}) => {
  return (
    <g fill={color.darkened} stroke={color.darkened}>
      <circle cx={`${x}%`} cy="50%" r={4} strokeWidth="2" />
    </g>
  )
}
