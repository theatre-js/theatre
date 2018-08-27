import React from 'react'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import {TColor} from '$tl/ui/panels/AllInOnePanel/Right/types'

interface IProps {
  color: TColor
  pointTime: number
  nextPointTime: number
  nextPointConnected: boolean
  nextNextPointTime?: number
  prevPointTime?: number
  prevPointConnected?: boolean
  move: number
}

export default ({
  color,
  pointTime,
  nextPointTime,
  nextPointConnected,
  nextNextPointTime,
  prevPointTime,
  prevPointConnected = false,
  move,
}: IProps) => {
  return (
    <g opacity={0.5}>
      {prevPointConnected && (
        <LineConnectorRect
          x={prevPointTime!}
          y={50}
          width={pointTime - prevPointTime!}
          color={color.darkened}
        />
      )}
      {nextPointConnected && (
        <LineConnectorRect
          x={nextPointTime}
          y={50}
          width={nextNextPointTime! - nextPointTime}
          color={color.darkened}
        />
      )}
      <LineConnectorRect
        x={pointTime}
        y={50}
        width={nextPointTime - pointTime}
        color={color.darkened}
      />
      <PointCircle x={pointTime} y={50} />
      <PointCircle x={nextPointTime} y={50} />

      {prevPointTime && <PointCircle x={prevPointTime!} y={50} />}
      <PointCircle x={pointTime + move} y={50} />
    </g>
  )
}
