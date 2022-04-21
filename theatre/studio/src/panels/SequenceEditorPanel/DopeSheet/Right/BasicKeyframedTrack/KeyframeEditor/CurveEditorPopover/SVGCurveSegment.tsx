import React from 'react'

const SVG_PADDING = 1
const SVG_CIRCLE_RADIUS = 0.1

const CURVE_COLOR = '#858585'
const CONTROL_COLOR = '#4f4f4f'
const CONTROL_HITZONE_COLOR = 'rgba(255, 255, 255, 0.1)'

type IProps = {
  easing: [number, number, number, number] | null
}

const SVGCurveSegment: React.FC<IProps> = (props) => {
  const {easing} = props
  if (easing) {
    return (
      <svg
        height="100%"
        width="100%"
        viewBox={`${-SVG_PADDING} ${-SVG_PADDING} ${1 + SVG_PADDING * 2} ${
          1 + SVG_PADDING * 2
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="1"
          x2={easing[0]}
          y2={1 - easing[1]}
          stroke={CONTROL_COLOR}
          strokeWidth="0.1"
        />
        <line
          x1="1"
          y1="0"
          x2={easing[2]}
          y2={1 - easing[3]}
          stroke={CONTROL_COLOR}
          strokeWidth="0.1"
        />

        <circle
          cx={easing[0]}
          cy={1 - easing[1]}
          r={0.2}
          fill={CONTROL_HITZONE_COLOR}
        />
        <circle
          cx={easing[2]}
          cy={1 - easing[3]}
          r={0.2}
          fill={CONTROL_HITZONE_COLOR}
        />

        <path
          d={`M0 1 C${easing[0]} ${1 - easing[1]} ${easing[2]} 
      ${1 - easing[3]} 1 0`}
          stroke={CURVE_COLOR}
          strokeWidth="0.08"
        />
        <circle cx={0} cy={1} r={SVG_CIRCLE_RADIUS} fill={CURVE_COLOR} />

        <circle
          cx={easing[0]}
          cy={1 - easing[1]}
          r={SVG_CIRCLE_RADIUS}
          fill={CURVE_COLOR}
        />

        <circle cx={1} cy={0} r={SVG_CIRCLE_RADIUS} fill={CURVE_COLOR} />

        <circle
          cx={easing[2]}
          cy={1 - easing[3]}
          r={SVG_CIRCLE_RADIUS}
          fill={CURVE_COLOR}
        />
      </svg>
    )
  } else return <></>
}
export default SVGCurveSegment
