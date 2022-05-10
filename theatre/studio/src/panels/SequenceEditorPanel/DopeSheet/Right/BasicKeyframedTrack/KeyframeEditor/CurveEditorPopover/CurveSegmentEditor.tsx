import React from 'react'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import clamp from 'lodash-es/clamp'
import type CurveEditorPopover from './CurveEditorPopover'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {CubicBezierHandles} from './shared'
import {useFreezableMemo} from './useFreezableMemo'
import {COLOR_BASE} from './colors'

// Defines the dimensions of the SVG viewbox space
const VIEWBOX_PADDING = 0.12
const VIEWBOX_SIZE = 1 + VIEWBOX_PADDING * 2

const PATTERN_DOT_SIZE = 0.01
const PATTERN_DOT_COUNT = 8
const PATTERN_GRID_SIZE = (1 - PATTERN_DOT_SIZE) / (PATTERN_DOT_COUNT - 1)

// The curve supports a gradient but currently is solid cyan
const CURVE_START_OVERSHOOT_COLOR = '#3EAAA4'
const CURVE_START_COLOR = '#3EAAA4'
const CURVE_MID_START_COLOR = '#3EAAA4'
const CURVE_MID_COLOR = '#3EAAA4'
const CURVE_MID_END_COLOR = '#3EAAA4'
const CURVE_END_COLOR = '#3EAAA4'
const CURVE_END_OVERSHOOT_COLOR = '#3EAAA4'

const CONTROL_COLOR = '#B3B3B3'
const HANDLE_COLOR = '#3eaaa4'
const HANDLE_HOVER_COLOR = '#67dfd8'

const Circle = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  r: 0.04px;
  pointer-events: none;
  transition: r 0.15s;
  fill: ${HANDLE_COLOR};
`

const HitZone = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  r: 0.09px;
  cursor: move;
  ${pointerEventsAutoInNormalMode};
  &:hover {
    opacity: 0.4;
  }
  &:hover + ${Circle} {
    fill: ${HANDLE_HOVER_COLOR};
  }
`

type IProps = {
  onCurveChange: (newHandles: CubicBezierHandles) => void
  onCancelCurveChange: () => void
} & Parameters<typeof CurveEditorPopover>[0]

const CurveSegmentEditor: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  // Calculations towards keeping the handles in the viewbox. The extremum space
  // of this editor vertically scales to keep the handles in the viewbox of the
  // SVG. This produces a nice "stretching space" effect while you are dragging
  // the handles.
  // Demo: https://user-images.githubusercontent.com/11082236/164542544-f1f66de2-f62e-44dd-b4cb-05b5f6e73a52.mp4
  const minY = Math.min(0, 1 - next.handles[1], 1 - cur.handles[3])
  const maxY = Math.max(1, 1 - next.handles[1], 1 - cur.handles[3])
  const h = Math.max(1, maxY - minY)

  const toExtremumSpace = (y: number) => (y - minY) / h

  const [refSVG, nodeSVG] = useRefAndState<SVGSVGElement | null>(null)

  const viewboxToElWidthRatio = VIEWBOX_SIZE / (nodeSVG?.clientWidth || 1)
  const viewboxToElHeightRatio = VIEWBOX_SIZE / (nodeSVG?.clientHeight || 1)

  const [refLeft, nodeLeft] = useRefAndState<SVGCircleElement | null>(null)
  useKeyframeDrag(nodeSVG, nodeLeft, props, (dx, dy) => {
    const handleX = clamp(cur.handles[2] + dx * viewboxToElWidthRatio, 0, 1)
    const handleY = cur.handles[3] - dy * viewboxToElHeightRatio

    return [handleX, handleY, next.handles[0], next.handles[1]]
  })

  const [refRight, nodeRight] = useRefAndState<SVGCircleElement | null>(null)
  useKeyframeDrag(nodeSVG, nodeRight, props, (dx, dy) => {
    const handleX = clamp(next.handles[0] + dx * viewboxToElWidthRatio, 0, 1)
    const handleY = next.handles[1] - dy * viewboxToElHeightRatio

    return [cur.handles[2], cur.handles[3], handleX, handleY]
  })

  const curvePathDAttrValue = `M0 ${toExtremumSpace(1)} C${
    cur.handles[2]
  } ${toExtremumSpace(1 - cur.handles[3])} 
${next.handles[0]} ${toExtremumSpace(1 - next.handles[1])} 1 ${toExtremumSpace(
    0,
  )}`

  return (
    <svg
      height="100%"
      width="100%"
      ref={refSVG}
      viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      fill="none"
    >
      <linearGradient id="myGradient" gradientTransform="rotate(90)">
        <stop
          offset={toExtremumSpace(-1)}
          stopColor={CURVE_END_OVERSHOOT_COLOR}
        />
        <stop offset={toExtremumSpace(0)} stopColor={CURVE_END_COLOR} />
        <stop offset={toExtremumSpace(0.3)} stopColor={CURVE_MID_END_COLOR} />
        <stop offset={toExtremumSpace(0.5)} stopColor={CURVE_MID_COLOR} />
        <stop offset={toExtremumSpace(0.7)} stopColor={CURVE_MID_START_COLOR} />
        <stop offset={toExtremumSpace(1)} stopColor={CURVE_START_COLOR} />
        <stop
          offset={toExtremumSpace(2)}
          stopColor={CURVE_START_OVERSHOOT_COLOR}
        />
      </linearGradient>

      {/* Unit space, opaque white dot pattern */}
      <pattern
        id="dot-background-pattern-1"
        width={PATTERN_GRID_SIZE}
        height={PATTERN_GRID_SIZE / h}
        y={-minY / h}
      >
        <rect
          width={PATTERN_DOT_SIZE}
          height={PATTERN_DOT_SIZE}
          fill={CONTROL_COLOR}
          opacity={0.3}
        ></rect>
      </pattern>
      <rect
        x={0}
        y={0}
        width="1"
        height={1}
        fill="url(#dot-background-pattern-1)"
      />
      {/* Fills the whole vertical extremum space, gray dot pattern */}
      <pattern
        id="dot-background-pattern-2"
        width={PATTERN_GRID_SIZE}
        height={PATTERN_GRID_SIZE}
      >
        <rect
          width={PATTERN_DOT_SIZE}
          height={PATTERN_DOT_SIZE}
          fill={CONTROL_COLOR}
        ></rect>
      </pattern>
      <rect
        x={0}
        y={toExtremumSpace(0)}
        width="1"
        height={toExtremumSpace(1) - toExtremumSpace(0)}
        fill="url(#dot-background-pattern-2)"
      />

      {/* Line from right end of curve to right handle */}
      <line
        x1={0}
        y1={toExtremumSpace(1)}
        x2={cur.handles[2]}
        y2={toExtremumSpace(1 - cur.handles[3])}
        stroke={CONTROL_COLOR}
        strokeWidth="0.01"
      />
      {/* Line from left end of curve to left handle */}
      <line
        x1={1}
        y1={toExtremumSpace(0)}
        x2={next.handles[0]}
        y2={toExtremumSpace(1 - next.handles[1])}
        stroke={CONTROL_COLOR}
        strokeWidth="0.01"
      />

      {/* Curve "shadow": the low-opacity filled area between the curve and the diagonal */}
      <path
        d={curvePathDAttrValue}
        stroke="none"
        fill="url('#myGradient')"
        opacity="0.1"
      />
      {/* The curve */}
      <path
        d={curvePathDAttrValue}
        stroke="url('#myGradient')"
        strokeWidth="0.02"
      />

      {/* Right end of curve */}
      <circle
        cx={0}
        cy={toExtremumSpace(1)}
        r="0.025"
        stroke={CURVE_START_COLOR}
        strokeWidth="0.02"
        fill={COLOR_BASE}
      />
      {/* Left end of curve */}
      <circle
        cx={1}
        cy={toExtremumSpace(0)}
        r="0.025"
        stroke={CURVE_END_COLOR}
        strokeWidth="0.02"
        fill={COLOR_BASE}
      />

      {/* Right handle and hit zone */}
      <HitZone
        ref={refLeft}
        cx={cur.handles[2]}
        cy={toExtremumSpace(1 - cur.handles[3])}
        fill={CURVE_START_COLOR}
        opacity={0.2}
      />
      <Circle cx={cur.handles[2]} cy={toExtremumSpace(1 - cur.handles[3])} />
      {/* Left handle and hit zone */}
      <HitZone
        ref={refRight}
        cx={next.handles[0]}
        cy={toExtremumSpace(1 - next.handles[1])}
        fill={CURVE_END_COLOR}
        opacity={0.2}
      />
      <Circle cx={next.handles[0]} cy={toExtremumSpace(1 - next.handles[1])} />
    </svg>
  )
}
export default CurveSegmentEditor

function useKeyframeDrag(
  svgNode: SVGSVGElement | null,
  node: SVGCircleElement | null,
  props: IProps,
  setHandles: (dx: number, dy: number) => CubicBezierHandles,
): void {
  const handlers = useFreezableMemo<Parameters<typeof useDrag>[1]>(
    (setFrozen) => ({
      debugName: 'CurveSegmentEditor/useKeyframeDrag',
      lockCursorTo: 'move',
      onDragStart() {
        setFrozen(true)
        return {
          onDrag(dx, dy) {
            if (!svgNode) return

            props.onCurveChange(setHandles(dx, dy))
          },
          onDragEnd(dragHappened) {
            setFrozen(false)
            props.onCancelCurveChange()
          },
        }
      },
    }),
    [svgNode, props.trackData],
  )

  useDrag(node, handlers)
}
