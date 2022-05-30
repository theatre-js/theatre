import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import getStudio from '@theatre/studio/getStudio'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import type {IAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import {AggregateKeyframeVisualDot, HitZone} from './AggregateKeyframeVisualDot'

type IAggregateKeyframeDotProps = {
  editorProps: IAggregateKeyframeEditorProps
  utils: IAggregateKeyframeEditorUtils
}

export function AggregateKeyframeDot(
  props: React.PropsWithChildren<IAggregateKeyframeDotProps>,
) {
  const logger = useLogger('AggregateKeyframeDot')
  const {cur} = props.utils

  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)
  const [isDragging] = useDragForAggregateKeyframeDot(node, props, {
    onClickFromDrag(dragStartEvent) {
      // TODO Aggregate inline keyframe editor
      // openEditor(dragStartEvent, ref.current!)
    },
  })

  const [contextMenu] = useAggregateKeyframeContextMenu(node, () =>
    logger._debug('Show Aggregate Keyframe', props),
  )

  return (
    <>
      <HitZone
        ref={ref}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging,
          position: cur.position,
        })}
      />
      <AggregateKeyframeVisualDot
        isAllHere={cur.allHere}
        isSelected={cur.selected}
      />
      {contextMenu}
    </>
  )
}

function useAggregateKeyframeContextMenu(
  target: HTMLDivElement | null,
  debugOnOpen: () => void,
) {
  // TODO: missing features: delete, copy + paste
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      return []
    },
    onOpen() {
      debugOnOpen()
    },
  })
}

function useDragForAggregateKeyframeDot(
  node: HTMLDivElement | null,
  props: IAggregateKeyframeDotProps,
  options: {
    /**
     * hmm: this is a hack so we can actually receive the
     * {@link MouseEvent} from the drag event handler and use
     * it for positioning the popup.
     */
    onClickFromDrag(dragStartEvent: MouseEvent): void
  },
): [isDragging: boolean] {
  const propsRef = useRef(props.editorProps)
  propsRef.current = props.editorProps
  const keyframesRef = useRef(props.utils.cur.keyframes)
  keyframesRef.current = props.utils.cur.keyframes

  const useDragOpts = useMemo<UseDragOpts>(() => {
    return {
      debugName: 'AggregateKeyframeDot/useDragKeyframe',
      onDragStart(event) {
        const props = propsRef.current
        const keyframes = keyframesRef.current

        if (
          props.selection &&
          props.aggregateKeyframes[props.index].selected ===
            AggregateKeyframePositionIsSelected.AllSelected
        ) {
          const {selection, viewModel} = props
          const {sheetObject} = viewModel
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag: keyframes[0].kf.position,
            })
            .onDragStart(event)
        }

        const propsAtStartOfDrag = props
        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )

        let tempTransaction: CommitOrDiscard | undefined

        return {
          onDrag(dx, dy, event) {
            const newPosition = Math.max(
              // check if our event hoversover a [data-pos] element
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: node,
              }) ??
                // if we don't find snapping target, check the distance dragged + original position
                keyframes[0].kf.position + toUnitSpace(dx),
              // sanitize to minimum of zero
              0,
            )

            tempTransaction?.discard()
            tempTransaction = undefined
            tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
              for (const keyframe of keyframes) {
                const original = keyframe.kf
                stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
                  {
                    ...propsAtStartOfDrag.viewModel.sheetObject.address,
                    trackId: keyframe.track.id,
                    keyframes: [{...original, position: newPosition}],
                    snappingFunction: val(
                      propsAtStartOfDrag.layoutP.sheet,
                    ).getSequence().closestGridPosition,
                  },
                )
              }
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) {
              tempTransaction?.commit()
            } else {
              tempTransaction?.discard()
              options.onClickFromDrag(event)
            }
          },
        }
      },
    }
  }, [])

  const [isDragging] = useDrag(node, useDragOpts)

  useLockFrameStampPosition(isDragging, props.utils.cur.position)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}
