import React from 'react'
import css from './handle.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  x: number
  y: number
  move: [number, number]
  color: string
  onClick: (evt: React.MouseEvent<SVGRectElement>) => any
}

export default ({x, y, move, color, onClick}: IProps) => {
  return (
    <>
      <rect
        width="12"
        height="12"
        x={`${x}%`}
        y={`${y}%`}
        fill="transparent"
        stroke="transparent"
        transform={`translate(${move[0] - 6} ${move[1] - 6})`}
        onClick={onClick}
        {...classes('handleClickArea')}
      />
      <circle
        strokeWidth="1"
        cx={`${x}%`}
        cy={`${y}%`}
        r={2}
        className={css.handle}
        stroke={color}
        fill={color}
      />
    </>
  )
}
