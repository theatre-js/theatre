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
    cursor: ew-resize;
  }

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  &.beingDragged {
    pointer-events: none !important;
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0] & {which: 'left' | 'right'}

const GraphEditorDotNonScalar: React.VFC<IProps> = (props) => {
  const [ref, node] = useRefAndState<SVGCircleElement | null>(null)

  const {index, trackData, itemKey} = props
  const cur = trackData.keyframes[index]

  const [contextMenu] = useKeyframeContextMenu(node, props)

  const presence = usePresence(itemKey)

  const curValue = props.which === 'left' ? 0 : 1

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
        {...presence.attrs}
        {...includeLockFrameStampAttrs(cur.position)}
        {...DopeSnap.includePositionSnapAttrs(cur.position)}
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

export default GraphEditorDotNonScalar

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
      debugName: 'GraphEditorDotNonScalar/useDragKeyframe',
      lockCSSCursorTo: 'ew-resize',
      onDragStart(event) {
        setIsDragging(true)
        const propsAtStartOfDrag = propsRef.current

        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )

        const unlockExtremums = propsAtStartOfDrag.extremumSpace.lock()
        let tempTransaction: CommitOrDiscard | undefined

        return {
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
