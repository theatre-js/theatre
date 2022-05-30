import {lighten} from 'polished'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import last from 'lodash-es/last'

import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'

import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {DeterminePropEditorForSingleKeyframe} from './DeterminePropEditorForSingleKeyframe'
import type {ISingleKeyframeEditorProps} from './SingleKeyframeEditor'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import type {ILogger} from '@theatre/shared/logger'

export const DOT_SIZE_PX = 6
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

const dotTheme = {
  normalColor: '#40AAA4',
  get selectedColor() {
    return lighten(0.35, dotTheme.normalColor)
  },
}

/** The keyframe diamond ◆ */
const Diamond = styled.div<{isSelected: boolean}>`
  position: absolute;
  ${absoluteDims(DOT_SIZE_PX)}

  background: ${(props) =>
    props.isSelected ? dotTheme.selectedColor : dotTheme.normalColor};
  transform: rotateZ(45deg);

  z-index: 1;
  pointer-events: none;
`

const HitZone = styled.div`
  z-index: 1;
  cursor: ew-resize;

  ${DopeSnapHitZoneUI.CSS}

  #pointer-root.draggingPositionInSequenceEditor & {
    ${DopeSnapHitZoneUI.CSS_WHEN_SOMETHING_DRAGGING}
  }

  &:hover
    + ${Diamond},
    // notice , "or" in CSS
    &.${DopeSnapHitZoneUI.BEING_DRAGGED_CLASS}
    + ${Diamond} {
    ${absoluteDims(DOT_HOVER_SIZE_PX)}
  }
`

type ISingleKeyframeDotProps = ISingleKeyframeEditorProps

/** The ◆ you can grab onto in "keyframe editor" (aka "dope sheet" in other programs) */
const SingleKeyframeDot: React.VFC<ISingleKeyframeDotProps> = (props) => {
  const logger = useLogger('SingleKeyframeDot')
  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useSingleKeyframeContextMenu(node, logger, props)
  const [inlineEditorPopover, openEditor] =
    useSingleKeyframeInlineEditorPopover(props)
  const [isDragging] = useDragForSingleKeyframeDot(node, props, {
    onClickFromDrag(dragStartEvent) {
      openEditor(dragStartEvent, ref.current!)
    },
  })

  return (
    <>
      <HitZone
        ref={ref}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging,
          position: props.keyframe.position,
        })}
      />
      <Diamond isSelected={!!props.selection} />
      {inlineEditorPopover}
      {contextMenu}
    </>
  )
}

export default SingleKeyframeDot

function useSingleKeyframeContextMenu(
  target: HTMLDivElement | null,
  logger: ILogger,
  props: ISingleKeyframeDotProps,
) {
  const maybeSelectedKeyframeIds = selectedKeyframeIdsIfInSingleTrack(
    props.selection,
  )

  const keyframeSelectionItem = maybeSelectedKeyframeIds
    ? copyKeyFrameContextMenuItem(props, maybeSelectedKeyframeIds)
    : copyKeyFrameContextMenuItem(props, [props.keyframe.id])

  const deleteItem = deleteSelectionOrKeyframeContextMenuItem(props)

  return useContextMenu(target, {
    displayName: 'Keyframe',
    menuItems: () => {
      return [keyframeSelectionItem, deleteItem]
    },
    onOpen() {
      logger._debug('Show keyframe', props)
    },
  })
}

/** The editor that pops up when directly clicking a Keyframe. */
function useSingleKeyframeInlineEditorPopover(props: ISingleKeyframeDotProps) {
  const editingTools = useEditingToolsForKeyframeEditorPopover(props)
  const label = props.leaf.propConf.label ?? last(props.leaf.pathToProp)

  return usePopover({debugName: 'useKeyframeInlineEditorPopover'}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      <DeterminePropEditorForSingleKeyframe
        propConfig={props.leaf.propConf}
        editingTools={editingTools}
        keyframeValue={props.keyframe.value}
        displayLabel={label != null ? String(label) : undefined}
      />
    </BasicPopover>
  ))
}

function useEditingToolsForKeyframeEditorPopover(
  props: ISingleKeyframeDotProps,
) {
  const obj = props.leaf.sheetObject
  return useTempTransactionEditingTools(({stateEditors}, value) => {
    const newKeyframe = {...props.keyframe, value}
    stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes({
      ...obj.address,
      trackId: props.leaf.trackId,
      keyframes: [newKeyframe],
      snappingFunction: obj.sheet.getSequence().closestGridPosition,
    })
  })
}

function useDragForSingleKeyframeDot(
  node: HTMLDivElement | null,
  props: ISingleKeyframeDotProps,
  options: {
    /**
     * hmm: this is a hack so we can actually receive the
     * {@link MouseEvent} from the drag event handler and use
     * it for positioning the popup.
     */
    onClickFromDrag(dragStartEvent: MouseEvent): void
  },
): [isDragging: boolean] {
  const propsRef = useRef(props)
  propsRef.current = props

  const useDragOpts = useMemo<UseDragOpts>(() => {
    return {
      debugName: 'KeyframeDot/useDragKeyframe',
      onDragStart(event) {
        const props = propsRef.current
        if (props.selection) {
          const {selection, leaf} = props
          const {sheetObject} = leaf
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag:
                props.trackData.keyframes[props.index].position,
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
            const original =
              propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index]
            const newPosition = Math.max(
              // check if our event hoversover a [data-pos] element
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: node,
              }) ??
                // if we don't find snapping target, check the distance dragged + original position
                original.position + toUnitSpace(dx),
              // sanitize to minimum of zero
              0,
            )

            tempTransaction?.discard()
            tempTransaction = undefined
            tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
                {
                  ...propsAtStartOfDrag.leaf.sheetObject.address,
                  trackId: propsAtStartOfDrag.leaf.trackId,
                  keyframes: [{...original, position: newPosition}],
                  snappingFunction: val(
                    propsAtStartOfDrag.layoutP.sheet,
                  ).getSequence().closestGridPosition,
                },
              )
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

  // Lock frame stamp to the current position of the dragged keyframe instead of
  // the mouse position, so that it appears centered above the keyframe even
  // regardless of where in the hit zone of the keyframe the mouse is located.
  useLockFrameStampPosition(isDragging, props.keyframe.position)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}

function deleteSelectionOrKeyframeContextMenuItem(
  props: ISingleKeyframeDotProps,
): IContextMenuItem {
  return {
    label: props.selection ? 'Delete Selection' : 'Delete Keyframe',
    callback: () => {
      if (props.selection) {
        props.selection.delete()
      } else {
        getStudio()!.transaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
            {
              ...props.leaf.sheetObject.address,
              keyframeIds: [props.keyframe.id],
              trackId: props.leaf.trackId,
            },
          )
        })
      }
    },
  }
}

function copyKeyFrameContextMenuItem(
  props: ISingleKeyframeDotProps,
  keyframeIds: string[],
): IContextMenuItem {
  return {
    label: keyframeIds.length > 1 ? 'Copy Selection' : 'Copy Keyframe',
    callback: () => {
      const keyframes = keyframeIds.map(
        (keyframeId) =>
          props.trackData.keyframes.find(
            (keyframe) => keyframe.id === keyframeId,
          )!,
      )

      getStudio!().transaction((api) => {
        api.stateEditors.studio.ahistoric.setClipboardKeyframes(keyframes)
      })
    },
  }
}
