import React from 'react'
import LineConnectorClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorClickArea'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'

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
