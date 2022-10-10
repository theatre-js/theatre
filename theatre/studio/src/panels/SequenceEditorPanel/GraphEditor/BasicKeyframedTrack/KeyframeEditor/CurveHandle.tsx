import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {clamp} from 'lodash-es'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {transformBox} from './Curve'
import type KeyframeEditor from './KeyframeEditor'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

export const dotSize = 6

const Circle = styled.circle`
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
  fill: var(--main-color);
  r: 2px;
  pointer-events: none;
`

const HitZone = styled.circle`
  stroke-width: 6px;
  vector-effect: non-scaling-stroke;
  r: 6px;
  fill: transparent;
  cursor: move;
  ${pointerEventsAutoInNormalMode};
  &:hover {
  }
  &:hover + ${Circle} {
    r: 6px;
  }
`

const Line = styled.path`
  stroke-width: 1;
  stroke: var(--main-color);
  /* stroke: gray; */
  fill: none;
  vector-effect: non-scaling-stroke;
`

type Which = 'left' | 'right'

type IProps = Parameters<typeof KeyframeEditor>[0] & {which: Which}

const CurveHandle: React.VFC<IProps> = (props) => {
  const [ref, node] = useRefAndState<SVGCircleElement | null>(null)

  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [contextMenu] = useOurContextMenu(node, props)
  useOurDrags(node, props)

  const posInDiffSpace =
    props.which === 'left' ? cur.handles[2] : next.handles[0]

  const posInUnitSpace =
    cur.position + (next.position - cur.position) * posInDiffSpace

  const valInDiffSpace =
    props.which === 'left' ? cur.handles[3] : next.handles[1]

  const curValue = props.isScalar ? (cur.value as number) : 0
  const nextValue = props.isScalar ? (next.value as number) : 1

  const value = curValue + (nextValue - curValue) * valInDiffSpace

  const valInExtremumSpace = props.extremumSpace.fromValueSpace(value)

  const heightInExtremumSpace =
    valInExtremumSpace -
    props.extremumSpace.fromValueSpace(
      props.which === 'left' ? curValue : nextValue,
    )

  const lineTransform = transformBox(
    props.which === 'left' ? cur.position : next.position,
    props.extremumSpace.fromValueSpace(
      props.which === 'left' ? curValue : nextValue,
    ),
    posInUnitSpace - (props.which === 'left' ? cur.position : next.position),
    heightInExtremumSpace,
  )

  return (
    <g>
      <HitZone
        ref={ref}
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${posInUnitSpace} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${valInExtremumSpace}) * 1px)`,
        }}
      ></HitZone>
      <Circle
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${posInUnitSpace} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${valInExtremumSpace}) * 1px)`,
        }}
      ></Circle>
      <Line
        d="M 0 0 L 1 1"
        style={{
          transform: lineTransform,
        }}
      />
      {contextMenu}
    </g>
  )
}

export default CurveHandle

function useOurDrags(node: SVGCircleElement | null, props: IProps): void {
  const propsRef = useRef(props)
  propsRef.current = props

  const handlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    return {
      debugName: 'CurveHandler/useOurDrags',
      lockCSSCursorTo: 'move',
      onDragStart() {
        let tempTransaction: CommitOrDiscard | undefined

        const propsAtStartOfDrag = propsRef.current

        const scaledToUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )
        const verticalToExtremumSpace = val(
          propsAtStartOfDrag.layoutP.graphEditorVerticalSpace.toExtremumSpace,
        )

        const unlockExtremums = propsAtStartOfDrag.extremumSpace.lock()

        return {
          onDrag(dxInScaledSpace, dy) {
            if (tempTransaction) {
              tempTransaction.discard()
              tempTransaction = undefined
            }

            const {index, trackData} = propsAtStartOfDrag
            const cur = trackData.keyframes[index]
            const next = trackData.keyframes[index + 1]

            const dPosInUnitSpace = scaledToUnitSpace(dxInScaledSpace)
            let dPosInKeyframeDiffSpace =
              dPosInUnitSpace / (next.position - cur.position)

            const dyInVerticalSpace = -dy
            const dYInExtremumSpace = verticalToExtremumSpace(dyInVerticalSpace)

            const dYInValueSpace =
              propsAtStartOfDrag.extremumSpace.deltaToValueSpace(
                dYInExtremumSpace,
              )

            const curValue = props.isScalar ? (cur.value as number) : 0
            const nextValue = props.isScalar ? (next.value as number) : 1
            const dyInKeyframeDiffSpace =
              dYInValueSpace / (nextValue - curValue)

            if (propsAtStartOfDrag.which === 'left') {
              const handleX = clamp(
                cur.handles[2] + dPosInKeyframeDiffSpace,
                0,
                1,
              )
              const handleY = cur.handles[3] + dyInKeyframeDiffSpace

              tempTransaction = getStudio()!.tempTransaction(
                ({stateEditors}) => {
                  stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
                    {
                      ...propsAtStartOfDrag.sheetObject.address,
                      snappingFunction: val(
                        propsAtStartOfDrag.layoutP.sheet,
                      ).getSequence().closestGridPosition,
                      trackId: propsAtStartOfDrag.trackId,
                      keyframes: [
                        {
                          ...cur,
                          handles: [
                            cur.handles[0],
                            cur.handles[1],
                            handleX,
                            handleY,
                          ],
                        },
                      ],
                    },
                  )
                },
              )
            } else {
              const handleX = clamp(
                next.handles[0] + dPosInKeyframeDiffSpace,
                0,
                1,
              )
              const handleY = next.handles[1] + dyInKeyframeDiffSpace

              tempTransaction = getStudio()!.tempTransaction(
                ({stateEditors}) => {
                  stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
                    {
                      ...propsAtStartOfDrag.sheetObject.address,
                      trackId: propsAtStartOfDrag.trackId,
                      snappingFunction: val(
                        propsAtStartOfDrag.layoutP.sheet,
                      ).getSequence().closestGridPosition,
                      keyframes: [
                        {
                          ...next,
                          handles: [
                            handleX,
                            handleY,
                            next.handles[2],
                            next.handles[3],
                          ],
                        },
                      ],
                    },
                  )
                },
              )
            }
          },
          onDragEnd(dragHappened) {
            unlockExtremums()
            if (dragHappened) {
              if (tempTransaction) {
                tempTransaction.commit()
              }
            } else {
              if (tempTransaction) {
                tempTransaction.discard()
              }
            }
          },
        }
      },
    }
  }, [])

  useDrag(node, handlers)
}

function useOurContextMenu(node: SVGCircleElement | null, props: IProps) {
  return useContextMenu(node, {
    menuItems: () => {
      return [
        {
          label: 'Delete',
          callback: () => {
            getStudio()!.transaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                {
                  ...props.sheetObject.address,
                  keyframeIds: [props.keyframe.id],
                  trackId: props.trackId,
                },
              )
            })
          },
        },
      ]
    },
  })
}
