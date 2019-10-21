import React from 'react'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import {
  IColorAccent,
  INormalizedPoint,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TempPointCircle} from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/TempPoint'

interface IProps {
  colorAccent: IColorAccent
  point: INormalizedPoint
  nextPoint?: INormalizedPoint
}

export default ({colorAccent, point, nextPoint}: IProps) => {
  const renderPointConnector =
    point.interpolationDescriptor.connected && nextPoint != null

  return (
    <g fill={colorAccent.darkened} stroke={colorAccent.darkened}>
      {renderPointConnector && (
        <LineConnectorRect
          x={point.time}
          y={50}
          width={nextPoint!.time - point.time}
          color={colorAccent.darkened}
        />
      )}
      <TempPointCircle colorAccent={colorAccent} x={point.time} />
    </g>
  )
}
