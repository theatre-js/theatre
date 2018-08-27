import React from 'react'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import {TColor, TNormalizedPoint} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {TempPointCircle} from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/TempPoint'

interface IProps {
  color: TColor
  point: TNormalizedPoint
  nextPoint?: TNormalizedPoint
}

export default ({color, point, nextPoint}: IProps) => {
  const renderPointConnector =
    point.interpolationDescriptor.connected && nextPoint != null

  return (
    <g fill={color.darkened} stroke={color.darkened}>
      {renderPointConnector && (
        <LineConnectorRect
          x={point.time}
          y={50}
          width={nextPoint!.time - point.time}
          color={color.darkened}
        />
      )}
      <TempPointCircle color={color} x={point.time} />
    </g>
  )
}
