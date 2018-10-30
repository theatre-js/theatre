import React from 'react'

interface IProps {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

export default ({x1, y1, x2, y2, color}: IProps) => {
  return (
    <g>
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        fill={color}
        stroke={color}
      />
    </g>
  )
}
