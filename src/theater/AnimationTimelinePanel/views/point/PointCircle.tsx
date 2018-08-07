import React from 'react'
import css from './point.css'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  x: number
  y: number
}

export default ({x, y}: IProps) => {
  return (
    <>
      <circle
        cx={`${x}%`}
        cy={`${y}%`}
        r={3.2}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        {...classes('pointStroke')}
      />
      <circle
        cx={`${x}%`}
        cy={`${y}%`}
        r={2.4}
        fill="#1C2226"
        stroke="transparent"
        {...classes('pointCenter')}
      />
    </>
  )
}
