import React from 'react'
import css from './point.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

export const POINT_RECT_EDGE_SIZE = 16

interface IProps {
  x: number
  y: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
  onContextMenu: (evt: React.MouseEvent<SVGRectElement>) => any
  forwardedRef: React.RefObject<SVGRectElement>
  dopesheet: boolean
}

export default ({x, y, onClick, onContextMenu, forwardedRef, dopesheet}: IProps) => {
  return (
    <>
      <rect
        x={`${x}%`}
        y={`${y}%`}
        width={POINT_RECT_EDGE_SIZE}
        height={POINT_RECT_EDGE_SIZE}
        fill="transparent"
        stroke="transparent"
        transform={`translate(${-POINT_RECT_EDGE_SIZE /
          2} ${-POINT_RECT_EDGE_SIZE / 2})`}
        onContextMenu={onContextMenu}
        onClick={onClick}
        ref={forwardedRef}
        {...classes('pointClickArea', dopesheet && 'ewCursor')}
      />
      <circle cx={`${x}%`} cy={`${y}%`} r={6} {...classes('pointGlow')} />
    </>
  )
}
