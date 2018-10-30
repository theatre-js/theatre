import React from 'react'
import css from './connector.css'
import resolveCss from '$shared/utils/resolveCss'
import {POINT_RECT_EDGE_SIZE} from '$theater/AnimationTimelinePanel/views/point/PointClickArea'

const classes = resolveCss(css)

interface IProps {
  x: number
  y: number
  width: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
  forwardedRef: React.RefObject<SVGRectElement>
}

export default ({x, y, width, onClick, forwardedRef}: IProps) => {
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
      ref={forwardedRef}
      {...classes('connectorClickArea')}
    />
  )
}
