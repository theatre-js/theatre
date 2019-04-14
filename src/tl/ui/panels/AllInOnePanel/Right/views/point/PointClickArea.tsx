import React from 'react'
import css from './point.css'
import resolveCss from '$shared/utils/resolveCss'
import noop from '$shared/utils/noop'

const classes = resolveCss(css)

export const POINT_RECT_EDGE_SIZE = 16

interface IProps {
  x: number
  y: number
  onClick: (evt: React.MouseEvent<SVGRectElement>) => void
  onContextMenu: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseMove?: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseLeave?: (evt: React.MouseEvent<SVGRectElement>) => void
  onMouseEnter?: (evt: React.MouseEvent<SVGRectElement>) => void
  forwardedRef: React.RefObject<SVGRectElement>
  dopesheet: boolean
}

export default ({
  x,
  y,
  onClick,
  onContextMenu,
  onMouseMove = noop,
  onMouseLeave = noop,
  onMouseEnter = noop,
  forwardedRef,
  dopesheet,
}: IProps) => {
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
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={forwardedRef}
        {...classes('pointClickArea', dopesheet && 'ewCursor')}
      />
      <circle
        cx={`${x}%`}
        cy={`${y}%`}
        r={6}
        {...classes('_deprecatedPointGlow')}
      />
    </>
  )
}
