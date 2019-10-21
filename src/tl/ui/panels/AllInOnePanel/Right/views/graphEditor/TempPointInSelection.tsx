import React from 'react'
import {
  IColorAccent,
  INormalizedPoint,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'

interface IProps {
  color: IColorAccent
  point: INormalizedPoint
  nextPoint?: INormalizedPoint
}

export default ({color, point, nextPoint}: IProps) => {
  const renderPointConnector =
    point.interpolationDescriptor.connected && nextPoint != null

  return (
    <g fill={color.darkened} stroke={color.darkened}>
      {renderPointConnector && (
        <BezierConnector
          leftPointTime={point.time}
          leftPointValue={point.value}
          rightPointTime={nextPoint!.time}
          rightPointValue={nextPoint!.value}
          handles={point.interpolationDescriptor.handles}
        />
      )}
      <PointCircle x={point.time} y={point.value} />
    </g>
  )
}
