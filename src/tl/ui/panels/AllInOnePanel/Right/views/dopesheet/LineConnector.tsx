import React from 'react'
import LineConnectorClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorClickArea'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import noop from '$shared/utils/noop'

interface IProps {
  x: number
  y: number
  width: number
  color: string
  onClick: (event: React.MouseEvent<SVGRectElement>) => void
  onContextMenu: (event: React.MouseEvent<SVGRectElement>) => void
}

export default React.forwardRef(
  (
    {x, y, width, color, onClick, onContextMenu}: IProps,
    ref: React.RefObject<SVGRectElement>,
  ) => {
    return (
      <>
        <LineConnectorClickArea
          x={x}
          y={y}
          width={width}
          onClick={onClick}
          onContextMenu={onContextMenu}
          forwardedRef={ref}
        />
        <LineConnectorRect x={x} y={y} width={width} color={color} />
      </>
    )
  },
)
