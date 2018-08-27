import React from 'react'
import {TColor, TNormalizedPoint} from '$tl/ui/panels/AllInOnePanel/Right/types'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'

interface IProps {
  color: TColor
  point: TNormalizedPoint
  nextPoint?: TNormalizedPoint
  prevPoint?: TNormalizedPoint
  isPrevPointSelected: boolean
  isNextPointSelected: boolean
}

export default ({
  color,
  point,
  prevPoint,
  nextPoint,
  isPrevPointSelected = false,
  isNextPointSelected = false,
}: IProps) => {
  const renderPointConnector =
    point.interpolationDescriptor.connected && nextPoint != null

  const renderPrevPointConnector =
    prevPoint != null && prevPoint.interpolationDescriptor.connected

  const prevPointColor = isPrevPointSelected ? color.darkened : color.normal
  const nextPointColor = isNextPointSelected ? color.darkened : color.normal

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
      {renderPrevPointConnector && (
        <BezierConnector
          leftPointTime={prevPoint!.time}
          leftPointValue={prevPoint!.value}
          rightPointTime={point.time}
          rightPointValue={point.value}
          handles={prevPoint!.interpolationDescriptor.handles}
        />
      )}
      <PointCircle x={point.time} y={point.value} />
      {prevPoint != null && (
        <g fill={prevPointColor} stroke={prevPointColor}>
          <PointCircle x={prevPoint.time} y={prevPoint.value} />
        </g>
      )}
      {nextPoint != null && (
        <g fill={nextPointColor} stroke={nextPointColor}>
          <PointCircle x={nextPoint.time} y={nextPoint.value} />
        </g>
      )}
    </g>
  )
}
