import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {VoidFn} from '@theatre/shared/utils/types'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {FrameStampPositionLock} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

export const dotSize = 6

const Circle = styled.circle`
  fill: var(--main-color);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;

  r: 2px;
`

const HitZone = styled.circle`
  stroke-width: 6px;
  vector-effect: non-scaling-stroke;
  r: 6px;
  fill: transparent;
  cursor: move;
  pointer-events: all;
  &:hover {
  }
  &:hover + ${Circle} {
    r: 6px;
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const Dot: React.FC<IProps> = (props) => {
  const [ref, node] = useRefAndState<SVGCircleElement | null>(null)

  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [contextMenu] = useKeyframeContextMenu(node, props)
  useDragKeyframe(node, props)

  const cyInExtremumSpace = props.extremumSpace.fromValueSpace(cur.value)

  return (
    <>
      <HitZone
        ref={ref}
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${cyInExtremumSpace}) * 1px)`,
        }}
      />
      <Circle
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${cyInExtremumSpace}) * 1px)`,
        }}
      />
      {contextMenu}
    </>
  )
}

export default Dot

function useDragKeyframe(node: SVGCircleElement | null, _props: IProps): void {
  const {getLock} = useFrameStampPosition()
  const propsRef = useRef(_props)
  propsRef.current = _props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']

    let propsAtStartOfDrag: IProps
    let tempTransaction: CommitOrDiscard | undefined
    let verticalToExtremumSpace: SequenceEditorPanelLayout['graphEditorVerticalSpace']['toExtremumSpace']
    let unlockExtremums: VoidFn | undefined
    let keepSpeeds = false
    let frameStampPositionLock: FrameStampPositionLock

    return {
      lockCursorTo: 'move',
      onDragStart(event) {
        keepSpeeds = !!event.altKey

        propsAtStartOfDrag = propsRef.current

        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
        verticalToExtremumSpace = val(
          propsAtStartOfDrag.layoutP.graphEditorVerticalSpace.toExtremumSpace,
        )
        unlockExtremums = propsAtStartOfDrag.extremumSpace.lock()
        frameStampPositionLock = getLock()
        frameStampPositionLock.set(propsAtStartOfDrag.keyframe.position)
      },
      onDrag(dx, dy) {
        const original =
          propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index]

        const deltaPos = toUnitSpace(dx)
        const dyInVerticalSpace = -dy
        const dYInExtremumSpace = verticalToExtremumSpace(dyInVerticalSpace)

        const dYInValueSpace =
          propsAtStartOfDrag.extremumSpace.deltaToValueSpace(dYInExtremumSpace)

        const updatedKeyframes: Keyframe[] = []

        const cur: Keyframe = {
          ...original,
          position: original.position + deltaPos,
          value: original.value + dYInValueSpace,
          handles: [...original.handles],
        }
        frameStampPositionLock.set(cur.position)
        updatedKeyframes.push(cur)

        if (keepSpeeds) {
          const prev =
            propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index - 1]

          if (prev && Math.abs(original.value - prev.value) > 0) {
            // cur.handles[1] = preserveLeftHandle(
            //   cur.handles[1],
            //   original.value,
            //   cur.value,
            //   prev.value,
            //   prev.value,
            // )
            const newPrev: Keyframe = {...prev, handles: [...prev.handles]}
            updatedKeyframes.push(newPrev)
            newPrev.handles[3] = preserveRightHandle(
              prev.handles[3],
              prev.value,
              prev.value,
              original.value,
              cur.value,
            )
          }
          const next =
            propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index + 1]

          if (next && Math.abs(original.value - next.value) > 0) {
            // cur.handles[3] = preserveRightHandle(
            //   cur.handles[3],
            //   original.value,
            //   cur.value,
            //   next.value,
            //   next.value,
            // )

            const newNext: Keyframe = {...next, handles: [...next.handles]}
            updatedKeyframes.push(newNext)
            newNext.handles[1] = preserveLeftHandle(
              newNext.handles[1],
              newNext.value,
              newNext.value,
              original.value,
              cur.value,
            )
          }
        }

        tempTransaction?.discard()
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
            {
              ...propsAtStartOfDrag.sheetObject.address,
              trackId: propsAtStartOfDrag.trackId,
              keyframes: updatedKeyframes,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        frameStampPositionLock.unlock()
        if (unlockExtremums) {
          const unlock = unlockExtremums
          unlockExtremums = undefined
          unlock()
        }
        if (dragHappened) {
          tempTransaction?.commit()
        } else {
          tempTransaction?.discard()
        }
        tempTransaction = undefined
      },
    }
  }, [])

  useDrag(node, gestureHandlers)
}

function useKeyframeContextMenu(node: SVGCircleElement | null, props: IProps) {
  return useContextMenu(node, {
    items: () => {
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

function preserveRightHandle(
  rightHandleInKeyframeDeltaSpace: number,
  originalValueOfMovedKeyframe: number,
  newValueOfMovedKeyframe: number,
  originalValueOfNeighbouringKeyframe: number,
  newValueOfNeighbouringKeyframe: number,
): number {
  const diffOfHandleYToMovingKeyframeInValueSpace =
    (originalValueOfNeighbouringKeyframe - originalValueOfMovedKeyframe) *
    rightHandleInKeyframeDeltaSpace

  const newHandleYInKeyframeDeltaSpace =
    diffOfHandleYToMovingKeyframeInValueSpace /
    (newValueOfNeighbouringKeyframe - newValueOfMovedKeyframe)

  return newHandleYInKeyframeDeltaSpace
}

function preserveLeftHandle(
  leftHandleInKeyframeDeltaSpace: number,
  originalValueOfMovedKeyframe: number,
  newValueOfMovedKeyframe: number,
  originalValueOfNeighbouringKeyframe: number,
  newValueOfNeighbouringKeyframe: number,
): number {
  const handleYInValueSpace =
    (originalValueOfMovedKeyframe - originalValueOfNeighbouringKeyframe) *
      leftHandleInKeyframeDeltaSpace +
    originalValueOfNeighbouringKeyframe

  const diffOfHandleYToMovingKeyframeInValueSpace =
    handleYInValueSpace - originalValueOfMovedKeyframe

  const newHandleYInValueSpace =
    diffOfHandleYToMovingKeyframeInValueSpace + newValueOfMovedKeyframe
  const diffOfNewHandleYToNeighbouringKeyframe =
    newHandleYInValueSpace - newValueOfNeighbouringKeyframe

  const newHandleYInKeyframeDeltaSpace =
    diffOfNewHandleYToNeighbouringKeyframe /
    (newValueOfMovedKeyframe - newValueOfNeighbouringKeyframe)

  return newHandleYInKeyframeDeltaSpace
}
