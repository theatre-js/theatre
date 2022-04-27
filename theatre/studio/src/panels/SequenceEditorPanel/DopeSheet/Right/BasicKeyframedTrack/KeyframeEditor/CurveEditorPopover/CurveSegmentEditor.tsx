import React from 'react'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import clamp from 'lodash-es/clamp'
import type CurveEditorPopover from './CurveEditorPopover'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {CubicBezierHandles} from './shared'
import {cssCubicBezierArgsFromHandles} from './shared'
import {useFreezableMemo} from './useFreezableMemo'

const VIEWBOX_PADDING = 0.12
const VIEWBOX_SIZE = 1 + VIEWBOX_PADDING * 2

const PATTERN_DOT_SIZE = 0.01
const PATTERN_DOT_COUNT = 8
const PATTERN_GRID_SIZE = (1 - PATTERN_DOT_SIZE) / (PATTERN_DOT_COUNT - 1)

const CURVE_START_OVERSHOOT_COLOR = 'rgb(64, 170, 164)'
const CURVE_START_COLOR = 'rgb(64, 170, 164)'
const CURVE_MID_START_COLOR = 'rgb(64, 170, 164)'
const CURVE_MID_COLOR = 'rgb(64, 170, 164)'
const CURVE_MID_END_COLOR = 'rgb(64, 170, 164)'
const CURVE_END_COLOR = 'rgb(64, 170, 164)'
const CURVE_END_OVERSHOOT_COLOR = 'rgb(64, 170, 164)'

const CONTROL_COLOR = '#B3B3B3'

const Circle = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  r: 0.05px;
  pointer-events: none;
`

const HitZone = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  r: 0.1px;
  cursor: move;
  ${pointerEventsAutoInNormalMode};
  &:hover {
  }
  &:hover + ${Circle} {
    r: 0.1px;
  }
`

type IProps = {
  editorState: {
    temporarilySetValue: (newCurve: string) => void
    discardTemporaryValue: () => void
  }
} & Parameters<typeof CurveEditorPopover>[0]

const CurveSegmentEditor: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

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

      <line
        x1={1}
        y1={toExtremumSpace(0)}
        x2={next.handles[0]}
        y2={toExtremumSpace(1 - next.handles[1])}
        stroke={CONTROL_COLOR}
        strokeWidth="0.01"
      />
      <line
        x1={0}
        y1={toExtremumSpace(1)}
        x2={cur.handles[2]}
        y2={toExtremumSpace(1 - cur.handles[3])}
        stroke={CONTROL_COLOR}
        strokeWidth="0.01"
      />

      <path
        d={`M0 ${toExtremumSpace(1)} C${cur.handles[2]} ${toExtremumSpace(
          1 - cur.handles[3],
        )} 
    ${next.handles[0]} ${toExtremumSpace(
          1 - next.handles[1],
        )} 1 ${toExtremumSpace(0)}`}
        stroke="none"
        fill="url('#myGradient')"
        opacity="0.1"
      />
      <path
        d={`M0 ${toExtremumSpace(1)} C${cur.handles[2]} ${toExtremumSpace(
          1 - cur.handles[3],
        )} 
    ${next.handles[0]} ${toExtremumSpace(
          1 - next.handles[1],
        )} 1 ${toExtremumSpace(0)}`}
        stroke="url('#myGradient')"
        strokeWidth="0.02"
      />

      <circle
        cx={0}
        cy={toExtremumSpace(1)}
        r="0.04"
        stroke={CURVE_START_COLOR}
        strokeWidth="0.02"
        fill="black"
      />

      <circle
        cx={1}
        cy={toExtremumSpace(0)}
        r="0.04"
        stroke={CURVE_END_COLOR}
        strokeWidth="0.02"
        fill="black"
      />

      <HitZone
        ref={refLeft}
        cx={cur.handles[2]}
        cy={toExtremumSpace(1 - cur.handles[3])}
        fill={CURVE_START_COLOR}
        opacity={0.2}
      />
      <Circle
        cx={cur.handles[2]}
        cy={toExtremumSpace(1 - cur.handles[3])}
        fill={CURVE_START_COLOR}
      />

      <HitZone
        ref={refRight}
        cx={next.handles[0]}
        cy={toExtremumSpace(1 - next.handles[1])}
        fill={CURVE_END_COLOR}
        opacity={0.2}
      />
      <Circle
        cx={next.handles[0]}
        cy={toExtremumSpace(1 - next.handles[1])}
        fill={CURVE_END_COLOR}
      />
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
      debugName: 'CurveSegmentEditor/useRightDrag',
      lockCursorTo: 'move',
      onDragStart() {
        setFrozen(true)
      },
      onDrag(dx, dy) {
        if (!svgNode) return

        props.editorState.temporarilySetValue(
          cssCubicBezierArgsFromHandles(setHandles(dx, dy)),
        )
      },
      onDragEnd(dragHappened) {
        setFrozen(false)
        if (!dragHappened) props.editorState.discardTemporaryValue()
      },
    }),
    [svgNode, props.trackData],
  )

  useDrag(node, handlers)
}
