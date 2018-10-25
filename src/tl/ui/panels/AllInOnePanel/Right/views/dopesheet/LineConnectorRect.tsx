import React from 'react'
import css from './connector.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  x: number
  y: number
  width: number
  color: string
}

export default ({x, y, width, color}: IProps) => {
  return (
    <rect
      x={`${x}%`}
      y={`${y}%`}
      width={`${width}%`}
      height="2px"
      transform={`translate(0 -1)`}
      fill={color}
      stroke={color}
      {...classes('connector')}
    />
  )
}
