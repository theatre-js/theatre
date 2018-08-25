import React from 'react'
import css from './connector.css'
import resolveCss from '$shared/utils/resolveCss'
import {POINT_RECT_EDGE_SIZE} from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointClickArea'
import noop from '$shared/utils/noop'

const classes = resolveCss(css)

interface IProps {
  x: number
  y: number
  width: number
  onClick: (event: React.MouseEvent<SVGRectElement>) => any
  onContextMenu: (event: React.MouseEvent<SVGRectElement>) => any
  forwardedRef: React.RefObject<SVGRectElement>
}

export default ({
  x,
  y,
  width,
  onClick,
  onContextMenu = noop,
  forwardedRef,
}: IProps) => {
  return (
    <rect
      x={`${x}%`}
      y={`${y}%`}
      width={`${width}%`}
      height={POINT_RECT_EDGE_SIZE}
      transform={`translate(0 ${-POINT_RECT_EDGE_SIZE / 2})`}
      fill="transparent"
      stroke="transparent"
      onClick={onClick}
      onContextMenu={onContextMenu}
      ref={forwardedRef}
      {...classes('connectorClickArea')}
    />
  )
}
