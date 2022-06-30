import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {includeLockFrameStampAttrs} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {
  lockedCursorCssVarName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {useKeyframeInlineEditorPopover} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/useSingleKeyframeInlineEditorPopover'
import usePresence, {
  PresenceFlag,
} from '@theatre/studio/uiComponents/usePresence'

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
    cursor: move;
  }

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  &.beingDragged {
    pointer-events: none !important;
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const GraphEditorDotScalar: React.VFC<IProps> = (props) => {
  const [ref, node] = useRefAndState<SVGCircleElement | null>(null)

  const {index, trackData} = props
  const cur = trackData.keyframes[index]

  const [contextMenu] = useKeyframeContextMenu(node, props)
  const presence = usePresence(props.itemKey)

  const curValue = cur.value as number

  const cyInExtremumSpace = props.extremumSpace.fromValueSpace(curValue)
  const [inlineEditorPopover, openEditor, _, _isInlineEditorPopoverOpen] =
    useKeyframeInlineEditorPopover({
      keyframe: props.keyframe,
      pathToProp: props.pathToProp,
      propConf: props.propConfig,
      sheetObject: props.sheetObject,
      trackId: props.trackId,
    })

  const isDragging = useDragKeyframe({
    node,
    props,
    // dragging does not work with also having a click listener
    onDetectedClick: (event) =>
      openEditor(event, event.target instanceof Element ? event.target : node!),
  })

  return (
    <>
      <HitZone
        ref={ref}
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${cyInExtremumSpace}) * 1px)`,
        }}
        {...includeLockFrameStampAttrs(cur.position)}
        {...DopeSnap.includePositionSnapAttrs(cur.position)}
        {...presence.attrs}
        className={isDragging ? 'beingDragged' : ''}
      />
      <Circle
        style={{
          // @ts-ignore
          cx: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position} * 1px)`,
          cy: `calc((var(--graphEditorVerticalSpace) - var(--graphEditorVerticalSpace) * ${cyInExtremumSpace}) * 1px)`,
          fill: presence.flag === PresenceFlag.Primary ? 'white' : undefined,
        }}
      />
      {inlineEditorPopover}
      {contextMenu}
    </>
  )
}

export default GraphEditorDotScalar

function useDragKeyframe(options: {
  node: SVGCircleElement | null
  props: IProps
  onDetectedClick: (event: MouseEvent) => void
}): boolean {
  const [isDragging, setIsDragging] = useState(false)
  useLockFrameStampPosition(isDragging, options.props.keyframe.position)
  const propsRef = useRef(options.props)
  propsRef.current = options.props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    return {
      debugName: 'GraphEditorDotScalar/useDragKeyframe',
      lockCSSCursorTo: 'move',
      onDragStart(event) {
        setIsDragging(true)
        const keepSpeeds = !!event.altKey

        const propsAtStartOfDrag = propsRef.current

        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )
        const verticalToExtremumSpace = val(
          propsAtStartOfDrag.layoutP.graphEditorVerticalSpace.toExtremumSpace,
        )
        const unlockExtremums = propsAtStartOfDrag.extremumSpace.lock()
        let tempTransaction: CommitOrDiscard | undefined

        return {
          onDrag(dx, dy) {
            const original =
              propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index]

            const deltaPos = toUnitSpace(dx)
            const dyInVerticalSpace = -dy
            const dYInExtremumSpace = verticalToExtremumSpace(dyInVerticalSpace)

            const dYInValueSpace =
              propsAtStartOfDrag.extremumSpace.deltaToValueSpace(
                dYInExtremumSpace,
              )

            const updatedKeyframes: Keyframe[] = []

            const cur: Keyframe = {
              ...original,
              position: original.position + deltaPos,
              value: (original.value as number) + dYInValueSpace,
              handles: [...original.handles],
            }

            updatedKeyframes.push(cur)

            if (keepSpeeds) {
              const prev =
                propsAtStartOfDrag.trackData.keyframes[
                  propsAtStartOfDrag.index - 1
                ]

              if (
                prev &&
                Math.abs((original.value as number) - (prev.value as number)) >
                  0
              ) {
                const newPrev: Keyframe = {
                  ...prev,
                  handles: [...prev.handles],
                }
                updatedKeyframes.push(newPrev)
                newPrev.handles[3] = preserveRightHandle(
                  prev.handles[3],
                  prev.value as number,
                  prev.value as number,
                  original.value as number,
                  cur.value as number,
                )
              }
              const next =
                propsAtStartOfDrag.trackData.keyframes[
                  propsAtStartOfDrag.index + 1
                ]

              if (
                next &&
                Math.abs((original.value as number) - (next.value as number)) >
                  0
              ) {
                const newNext: Keyframe = {
                  ...next,
                  handles: [...next.handles],
                }
                updatedKeyframes.push(newNext)
                newNext.handles[1] = preserveLeftHandle(
                  newNext.handles[1],
                  newNext.value as number,
                  newNext.value as number,
                  original.value as number,
                  cur.value as number,
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
                  snappingFunction: val(
                    propsAtStartOfDrag.layoutP.sheet,
                  ).getSequence().closestGridPosition,
                },
              )
            })
          },
          onDragEnd(dragHappened) {
            setIsDragging(false)
            unlockExtremums()
            if (dragHappened) {
              tempTransaction?.commit()
            } else {
              tempTransaction?.discard()
              options.onDetectedClick(event)
            }
          },
        }
      },
    }
  }, [])

  useDrag(options.node, gestureHandlers)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'move')
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
