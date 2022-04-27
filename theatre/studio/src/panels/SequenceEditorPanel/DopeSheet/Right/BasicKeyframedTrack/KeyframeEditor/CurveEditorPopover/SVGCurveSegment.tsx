import React from 'react'
import type {CubicBezierHandles} from './shared'

const VIEWBOX_PADDING = 0.75
const SVG_CIRCLE_RADIUS = 0.1
const VIEWBOX_SIZE = 1 + VIEWBOX_PADDING * 2

const SELECTED_CURVE_COLOR = '#F5F5F5'
const CURVE_COLOR = '#888888'
const CONTROL_COLOR = '#4f4f4f'
const CONTROL_HITZONE_COLOR = 'rgba(255, 255, 255, 0.1)'

// SVG's y coordinates go from top to bottom, e.g. 1 is vertically lower than 0,
// but easing points go from bottom to top.
const toVerticalSVGSpace = (y: number) => 1 - y

type IProps = {
  easing: CubicBezierHandles | null
  isSelected: boolean
}

const SVGCurveSegment: React.FC<IProps> = (props) => {
  const {easing, isSelected} = props

  if (!easing) return <></>

  const curveColor = isSelected ? SELECTED_CURVE_COLOR : CURVE_COLOR

  const LEFT_CONTROL_POINT = [easing[0], toVerticalSVGSpace(easing[1])]
  const RIGHT_CONTROL_POINT = [easing[2], toVerticalSVGSpace(easing[3])]

  return (
    <svg
      height="100%"
      width="100%"
      // With a padding of 0, this results in a "unit viewbox" i.e. `0 0 1 1`.
      // With padding e.g. VIEWBOX_PADDING=0.1, this results in a viewbox of `-0.1 -0,1 1.2 1.2`,
      // i.e. a viewbox with a top left coordinate of -0.1,-0.1 and a width and height of 1.2,
      // resulting in bottom right coordinate of 1.1,1.1
      viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Control lines */}
      <line
        x1="0"
        y1="1"
        x2={LEFT_CONTROL_POINT[0]}
        y2={LEFT_CONTROL_POINT[1]}
        stroke={CONTROL_COLOR}
        strokeWidth="0.1"
      />
      <line
        x1="1"
        y1="0"
        x2={RIGHT_CONTROL_POINT[0]}
        y2={RIGHT_CONTROL_POINT[1]}
        stroke={CONTROL_COLOR}
        strokeWidth="0.1"
      />

      {/* Control point hitzonecircles */}
      <circle
        cx={LEFT_CONTROL_POINT[0]}
        cy={LEFT_CONTROL_POINT[1]}
        r={0.2}
        fill={CONTROL_HITZONE_COLOR}
      />
      <circle
        cx={RIGHT_CONTROL_POINT[0]}
        cy={RIGHT_CONTROL_POINT[1]}
        r={0.2}
        fill={CONTROL_HITZONE_COLOR}
      />

      {/* Control point circles */}
      <circle
        cx={LEFT_CONTROL_POINT[0]}
        cy={LEFT_CONTROL_POINT[1]}
        r={SVG_CIRCLE_RADIUS}
        fill={CONTROL_COLOR}
      />
      <circle
        cx={RIGHT_CONTROL_POINT[0]}
        cy={RIGHT_CONTROL_POINT[1]}
        r={SVG_CIRCLE_RADIUS}
        fill={CONTROL_COLOR}
      />

      {/* Bezier curve */}
      <path
        d={`M0 1 C${LEFT_CONTROL_POINT[0]} ${LEFT_CONTROL_POINT[1]} ${RIGHT_CONTROL_POINT[0]} 
      ${RIGHT_CONTROL_POINT[1]} 1 0`}
        stroke={curveColor}
        strokeWidth="0.08"
      />
      <circle cx={0} cy={1} r={SVG_CIRCLE_RADIUS} fill={curveColor} />
      <circle cx={1} cy={0} r={SVG_CIRCLE_RADIUS} fill={curveColor} />
    </svg>
  )
}
export default SVGCurveSegment
