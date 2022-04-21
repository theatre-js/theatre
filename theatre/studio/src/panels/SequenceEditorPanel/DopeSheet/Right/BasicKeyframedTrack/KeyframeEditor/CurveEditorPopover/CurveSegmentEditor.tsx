import React from 'react'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {Keyframe} from '@theatre/core/src/projects/store/types/SheetState_Historic'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import clamp from 'lodash-es/clamp'
import type CurveEditorPopover from './CurveEditorPopover'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import getStudio from '@theatre/studio/getStudio'
import {val} from '@theatre/dataverse'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {useFreezableMemo} from './shared'

const VIEWBOX_PADDING = 0.12
const VIEWBOX_SIZE = 1 + VIEWBOX_PADDING * 2

const PATTERN_DOT_SIZE = 0.01
const PATTERN_DOT_COUNT = 8
const PATTERN_GRID_SIZE = (1 - PATTERN_DOT_SIZE) / (PATTERN_DOT_COUNT - 1)

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

type IProps = Parameters<typeof CurveEditorPopover>[0]

const CurveSegmentEditor: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [refSVG, nodeSVG] = useRefAndState<SVGSVGElement | null>(null)

  const VIEWBOX_WIDTH_RATIO = VIEWBOX_SIZE / (nodeSVG?.clientWidth || 1)
  const VIEWBOX_HEIGHT_RATIO = VIEWBOX_SIZE / (nodeSVG?.clientHeight || 1)

  const [refLeft, nodeLeft] = useRefAndState<SVGCircleElement | null>(null)
  useKeyframeDrag(nodeSVG, nodeLeft, props, (dx, dy) => {
    const handleX = clamp(cur.handles[2] + dx * VIEWBOX_WIDTH_RATIO, 0, 1)
    const handleY = cur.handles[3] - dy * VIEWBOX_HEIGHT_RATIO

    return {
      ...cur,
      handles: [cur.handles[0], cur.handles[1], handleX, handleY],
    }
  })

  const [refRight, nodeRight] = useRefAndState<SVGCircleElement | null>(null)
  useKeyframeDrag(nodeSVG, nodeRight, props, (dx, dy) => {
    const handleX = clamp(next.handles[0] + dx * VIEWBOX_WIDTH_RATIO, 0, 1)
    const handleY = next.handles[1] - dy * VIEWBOX_HEIGHT_RATIO

    return {
      ...next,
      handles: [handleX, handleY, next.handles[2], next.handles[3]],
    }
  })

  const min = Math.min(0, 1 - next.handles[1], 1 - cur.handles[3])
  const max = Math.max(1, 1 - next.handles[1], 1 - cur.handles[3])
  const h = Math.max(1, max - min)

  const toExtremumSpace = (n: number) => (n - min) / h

  return (
    <svg
      height="100%"
      width="100%"
      ref={refSVG}
      viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <linearGradient id="myGradient" gradientTransform="rotate(90)">
        <stop offset={toExtremumSpace(-1)} stopColor="#f64409" />
        <stop offset={toExtremumSpace(0)} stopColor="#F68109" />
        <stop offset={toExtremumSpace(0.2)} stopColor="#F68109" />
        <stop offset={toExtremumSpace(0.5)} stopColor="#aff792" />
        <stop offset={toExtremumSpace(0.8)} stopColor="#1ECDC4" />
        <stop offset={toExtremumSpace(1)} stopColor="#1ECDC4" />
        <stop offset={toExtremumSpace(2)} stopColor="#1eb6cd" />
      </linearGradient>

      <pattern
        id="dot-background-pattern-2"
        width={PATTERN_GRID_SIZE}
        height={PATTERN_GRID_SIZE}
      >
        <rect
          width={PATTERN_DOT_SIZE}
          height={PATTERN_DOT_SIZE}
          fill="#B3B3B3"
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
        stroke="#B3B3B3"
        strokeWidth="0.01"
      />
      <line
        x1={0}
        y1={toExtremumSpace(1)}
        x2={cur.handles[2]}
        y2={toExtremumSpace(1 - cur.handles[3])}
        stroke="#B3B3B3"
        strokeWidth="0.01"
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
        r="0.04px"
        stroke="#1ECDC4"
        strokeWidth="0.02px"
        fill="black"
      />

      <circle
        cx={1}
        cy={toExtremumSpace(0)}
        r="0.04px"
        stroke="#F68109"
        strokeWidth="0.02px"
        fill="black"
      />

      <HitZone
        ref={refLeft}
        cx={cur.handles[2]}
        cy={toExtremumSpace(1 - cur.handles[3])}
        fill="#1ECDC4"
        opacity={0.2}
      />
      <Circle
        cx={cur.handles[2]}
        cy={toExtremumSpace(1 - cur.handles[3])}
        fill="#1ECDC4"
      />

      <HitZone
        ref={refRight}
        cx={next.handles[0]}
        cy={toExtremumSpace(1 - next.handles[1])}
        fill="#F68109"
        opacity={0.2}
      />
      <Circle
        cx={next.handles[0]}
        cy={toExtremumSpace(1 - next.handles[1])}
        fill="#F68109"
      />
    </svg>
  )
}
export default CurveSegmentEditor

function useKeyframeDrag(
  svgNode: SVGSVGElement | null,
  node: SVGCircleElement | null,
  props: IProps,
  setKeyframe: (dx: number, dy: number) => Keyframe,
): void {
  const handlers = useFreezableMemo<Parameters<typeof useDrag>[1]>(
    (setFrozen) => {
      // Considered using "scrub" instead to manage a not-necessarilly commital change over time
      // But it appears that scrub doesn't allow to change a "pointer" for the keyframes
      let tempTransaction: CommitOrDiscard | undefined

      return {
        debugName: 'CurveSegmentEditor/useRightDrag',
        lockCursorTo: 'move',
        onDragStart() {
          setFrozen(true)
        },
        onDrag(dx, dy) {
          if (!svgNode) return
          tempTransaction?.discard()
          tempTransaction = undefined

          tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
              {
                ...props.leaf.sheetObject.address,
                snappingFunction: val(props.layoutP.sheet).getSequence()
                  .closestGridPosition,
                trackId: props.leaf.trackId,
                keyframes: [setKeyframe(dx, dy)],
              },
            )
          })
        },
        onDragEnd(dragHappened) {
          setFrozen(false)
          if (dragHappened) tempTransaction?.commit()
          else tempTransaction?.discard()
          tempTransaction = undefined
        },
      }
    },
    [svgNode, props.trackData],
  )

  useDrag(node, handlers)
}
