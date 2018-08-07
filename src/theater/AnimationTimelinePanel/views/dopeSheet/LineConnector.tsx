import React from 'react'
import LineConnectorClickArea from '$theater/AnimationTimelinePanel/views/dopeSheet/LineConnectorClickArea'
import LineConnectorRect from '$theater/AnimationTimelinePanel/views/dopeSheet/LineConnectorRect'

interface IProps {
  x: number
  y: number
  width: number
  color: string
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
}

export default React.forwardRef(
  ({x, y, width, color, onClick}: IProps, ref: React.RefObject<SVGRectElement>) => {
    return (
      <>
        <LineConnectorClickArea
          x={x}
          y={y}
          width={width}
          onClick={onClick}
          forwardedRef={ref}
        />
        <LineConnectorRect x={x} y={y} width={width} color={color} />
      </>
    )
  },
)
