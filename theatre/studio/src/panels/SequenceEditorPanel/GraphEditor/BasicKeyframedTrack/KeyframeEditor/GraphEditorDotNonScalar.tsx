import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {VoidFn} from '@theatre/shared/utils/types'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {attributeNameThatLocksFramestamp} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {
  lockedCursorCssPropName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'

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
  ${pointerEventsAutoInNormalMode};

  &:hover + ${Circle} {
    r: 6px;
  }

  #pointer-root.normal & {
    cursor: ew-resize;
  }

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssPropName});
  }

  &.beingDragged {
    pointer-events: none !important;
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0] & {which: 'left' | 'right'}

const GraphEditorDotNonScalar: React.VFC<IProps> = (props) => {
  const [ref, node] = useRefAndState<SVGCircleElement | null>(null)

  const {index, trackData} = props
  const cur = trackData.keyframes[index]

  const [contextMenu] = useKeyframeContextMenu(node, props)

  const curValue = props.which === 'left' ? 0 : 1

  const isDragging = useDragKeyframe(node, props)

  const cyInExtremumSpace = props.extremumSpace.fromValueSpace(curValue)

  return (
    <>
      <HitZone
        ref={ref}
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${cyInExtremumSpace}) * 1px)`,
        }}
        {...{
          [attributeNameThatLocksFramestamp]: cur.position.toFixed(3),
        }}
        data-pos={cur.position.toFixed(3)}
        className={isDragging ? 'beingDragged' : ''}
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

export default GraphEditorDotNonScalar

function useDragKeyframe(
  node: SVGCircleElement | null,
  _props: IProps,
): boolean {
  const [isDragging, setIsDragging] = useState(false)
  useLockFrameStampPosition(isDragging, _props.keyframe.position)
  const propsRef = useRef(_props)
  propsRef.current = _props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']

    let propsAtStartOfDrag: IProps
    let tempTransaction: CommitOrDiscard | undefined
    let unlockExtremums: VoidFn | undefined

    return {
      debugName: 'GraphEditorDotNonScalar/useDragKeyframe',
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        setIsDragging(true)

        propsAtStartOfDrag = propsRef.current

        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)

        unlockExtremums = propsAtStartOfDrag.extremumSpace.lock()
      },
      onDrag(dx, dy) {
        const original =
          propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index]

        const deltaPos = toUnitSpace(dx)

        const updatedKeyframes: Keyframe[] = []

        const cur: Keyframe = {
          ...original,
          position: original.position + deltaPos,
          value: original.value,
          handles: [...original.handles],
        }

        updatedKeyframes.push(cur)

        tempTransaction?.discard()
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
            {
              ...propsAtStartOfDrag.sheetObject.address,
              trackId: propsAtStartOfDrag.trackId,
              keyframes: updatedKeyframes,
              snappingFunction: val(
                propsAtStartOfDrag.layoutP.sheet,
              ).getSequence().closestGridPosition,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        setIsDragging(false)
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
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')
  return isDragging
}

function useKeyframeContextMenu(node: SVGCircleElement | null, props: IProps) {
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
