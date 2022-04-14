import React, {useMemo, useRef, useState} from 'react'
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

const SVG_CURVE_COLOR = '#b98b08'
const SVG_PADDING = 0.12
const SVG_CIRCLE_RADIUS = 0.08

const Circle = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  fill: #b98b08;
  r: 0.05px;
  pointer-events: none;
`

const HitZone = styled.circle`
  stroke-width: 0.1px;
  vector-effect: non-scaling-stroke;
  r: 0.2px;
  fill: transparent;
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

  const [refLeft, nodeLeft] = useRefAndState<SVGCircleElement | null>(null)
  useLeftDrag(nodeSVG, nodeLeft, props, cur)

  const [refRight, nodeRight] = useRefAndState<SVGCircleElement | null>(null)
  useRightDrag(nodeSVG, nodeRight, props, next)

  return (
    <svg
      ref={refSVG}
      viewBox={`${-SVG_PADDING} ${-SVG_PADDING} ${1 + SVG_PADDING * 2} ${
        1 + SVG_PADDING * 2
      }`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`M0 1 C${cur.handles[2]} ${1 - cur.handles[3]} 
    ${next.handles[0]} ${1 - next.handles[1]} 1 0`}
        stroke={SVG_CURVE_COLOR}
        strokeWidth="0.02"
      />

      <circle cx={0} cy={1} r={SVG_CIRCLE_RADIUS} fill={SVG_CURVE_COLOR} />
      <line
        x1="0"
        y1="1"
        x2={cur.handles[2]}
        y2={1 - cur.handles[3]}
        stroke={SVG_CURVE_COLOR}
        strokeWidth="0.01"
      />
      <HitZone
        ref={refLeft}
        cx={cur.handles[2]}
        cy={1 - cur.handles[3]}
      ></HitZone>
      <Circle cx={cur.handles[2]} cy={1 - cur.handles[3]}></Circle>

      <circle cx={1} cy={0} r={SVG_CIRCLE_RADIUS} fill={SVG_CURVE_COLOR} />
      <line
        x1="1"
        y1="0"
        x2={next.handles[0]}
        y2={1 - next.handles[1]}
        stroke={SVG_CURVE_COLOR}
        strokeWidth="0.01"
      />
      <circle
        ref={refRight}
        cx={next.handles[0]}
        cy={1 - next.handles[1]}
        r={0.03}
        fill={SVG_CURVE_COLOR}
      />
    </svg>
  )
}
export default CurveSegmentEditor

function useLeftDrag(
  svgNode: SVGSVGElement | null,
  node: SVGCircleElement | null,
  props: IProps,
  keyframe: Keyframe,
): void {
  const handlers = useFreezableMemo<Parameters<typeof useDrag>[1]>(
    (setFreeze) => {
      // Considered using "scrub" instead to manage a not-necessarilly commital change over time
      // But it appears that scrub doesn't allow to change a "pointer" for the keyframes
      let tempTransaction: CommitOrDiscard | undefined

      return {
        lockCursorTo: 'move',
        onDragStart() {
          setFreeze(true)
        },
        onDrag(dx, dy) {
          if (!svgNode) return
          tempTransaction?.discard()
          tempTransaction = undefined

          const handleX = clamp(
            keyframe.handles[2] +
              (dx * svgNode?.viewBox.baseVal.width) / svgNode?.clientWidth,
            0,
            1,
          )
          const handleY =
            keyframe.handles[3] -
            (dy * svgNode?.viewBox.baseVal.height) / svgNode?.clientHeight

          tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
              {
                ...props.leaf.sheetObject.address,
                snappingFunction: val(props.layoutP.sheet).getSequence()
                  .closestGridPosition,
                trackId: props.leaf.trackId,
                keyframes: [
                  {
                    ...keyframe,
                    handles: [
                      keyframe.handles[0],
                      keyframe.handles[1],
                      handleX,
                      handleY,
                    ],
                  },
                ],
              },
            )
          })
        },
        onDragEnd(dragHappened) {
          setFreeze(false)
          if (dragHappened) tempTransaction?.commit()
          else tempTransaction?.discard()
          tempTransaction = undefined
        },
      }
    },
    [svgNode, keyframe],
  )

  useDrag(node, handlers)
}

function useRightDrag(
  svgNode: SVGSVGElement | null,
  node: SVGCircleElement | null,
  props: IProps,
  keyframe: Keyframe,
): void {
  const handlers = useFreezableMemo<Parameters<typeof useDrag>[1]>(
    (setFrozen) => {
      // Considered using "scrub" instead to manage a not-necessarilly commital change over time
      // But it appears that scrub doesn't allow to change a "pointer" for the keyframes
      let tempTransaction: CommitOrDiscard | undefined

      return {
        lockCursorTo: 'move',
        onDragStart() {
          setFrozen(true)
        },
        onDrag(dx, dy) {
          if (!svgNode) return
          tempTransaction?.discard()
          tempTransaction = undefined

          const handleX = clamp(
            keyframe.handles[0] +
              (dx * svgNode?.viewBox.baseVal.width) / svgNode?.clientWidth,
            0,
            1,
          )
          const handleY =
            keyframe.handles[1] -
            (dy * svgNode?.viewBox.baseVal.height) / svgNode?.clientHeight

          tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
              {
                ...props.leaf.sheetObject.address,
                snappingFunction: val(props.layoutP.sheet).getSequence()
                  .closestGridPosition,
                trackId: props.leaf.trackId,
                keyframes: [
                  {
                    ...keyframe,
                    handles: [
                      handleX,
                      handleY,
                      keyframe.handles[0],
                      keyframe.handles[1],
                    ],
                  },
                ],
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
    [svgNode, keyframe],
  )

  useDrag(node, handlers)
}

/**
 * The same as useMemo except that it can be frozen so that
 * the memoized function is not recomputed even if the dependencies
 * change. It can also be unfrozen.
 *
 * An unfrozen useFreezableMemo is the same as useMemo.
 *
 */
function useFreezableMemo<T>(
  fn: (setFreeze: (isFrozen: boolean) => void) => T,
  deps: any[],
): T {
  const [isFrozen, setFreeze] = useState<boolean>(false)
  const freezableDeps = useRef(deps)

  if (!isFrozen) freezableDeps.current = deps

  return useMemo(() => fn(setFreeze), freezableDeps.current)
}

function useRefreshableMemo<T>(
  fn: (refresh: () => void) => T,
  additionalDeps: any[],
): T {
  const [version, setVersion] = useState(0)
  return useMemo(
    () => fn(() => setVersion(version + 1)),
    [version, ...additionalDeps],
  )
}
