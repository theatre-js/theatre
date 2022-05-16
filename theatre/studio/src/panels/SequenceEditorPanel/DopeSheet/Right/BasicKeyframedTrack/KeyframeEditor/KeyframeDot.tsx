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
import {
  includeLockFrameStampAttrs,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {
  lockedCursorCssVarName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'
import SnapCursor from './SnapCursor.svg'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import type {IKeyframeEditorProps} from './KeyframeEditor'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'

import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {DeterminePropEditorForKeyframe} from './DeterminePropEditorForKeyframe'

export const DOT_SIZE_PX = 6
const HIT_ZONE_SIZE_PX = 12
const SNAP_CURSOR_SIZE_PX = 34
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

const dims = (size: number) => `
  left: ${-size / 2}px;
  top: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const dotTheme = {
  normalColor: '#40AAA4',
  get selectedColor() {
    return lighten(0.35, dotTheme.normalColor)
  },
}

/** The keyframe diamond ◆ */
const Diamond = styled.div<{isSelected: boolean}>`
  position: absolute;
  ${dims(DOT_SIZE_PX)}

  background: ${(props) =>
    props.isSelected ? dotTheme.selectedColor : dotTheme.normalColor};
  transform: rotateZ(45deg);

  z-index: 1;
  pointer-events: none;
  ${dims(DOT_SIZE_PX)}
`

const HitZone = styled.div`
  position: absolute;
  ${dims(HIT_ZONE_SIZE_PX)};

  z-index: 1;

  cursor: ew-resize;

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});

    // ⸢⸤⸣⸥ thing
    // This box extends the hitzone so the user does not
    // accidentally leave the hitzone
    &:hover:after {
      position: absolute;
      top: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      left: calc(50% - ${SNAP_CURSOR_SIZE_PX / 2}px);
      width: ${SNAP_CURSOR_SIZE_PX}px;
      height: ${SNAP_CURSOR_SIZE_PX}px;
      display: block;
      content: ' ';
      background: url(${SnapCursor}) no-repeat 100% 100%;
      // This icon might also fit: GiConvergenceTarget
    }
  }

  &.beingDragged {
    pointer-events: none !important;
  }

  &:hover + ${Diamond}, &.beingDragged + ${Diamond} {
    ${dims(DOT_HOVER_SIZE_PX)}
  }
`

type IKeyframeDotProps = IKeyframeEditorProps

/** The ◆ you can grab onto in "keyframe editor" (aka "dope sheet" in other programs) */
const KeyframeDot: React.VFC<IKeyframeDotProps> = (props) => {
  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useKeyframeContextMenu(node, props)
  const [inlineEditorPopover, openEditor] =
    useKeyframeInlineEditorPopover(props)
  const [isDragging] = useDragForKeyframeDot(node, props, {
    onClickFromDrag(dragStartEvent) {
      openEditor(dragStartEvent, ref.current!)
    },
  })

  return (
    <>
      <HitZone
        ref={ref}
        {...includeLockFrameStampAttrs(props.keyframe.position)}
        {...DopeSnap.includePositionSnapAttrs(props.keyframe.position)}
        className={isDragging ? 'beingDragged' : ''}
      />
      <Diamond isSelected={!!props.selection} />
      {inlineEditorPopover}
      {contextMenu}
    </>
  )
}

export default KeyframeDot

function useKeyframeContextMenu(
  target: HTMLDivElement | null,
  props: IKeyframeDotProps,
) {
  const maybeSelectedKeyframeIds = selectedKeyframeIdsIfInSingleTrack(
    props.selection,
  )

  const keyframeSelectionItem = maybeSelectedKeyframeIds
    ? copyKeyFrameContextMenuItem(props, maybeSelectedKeyframeIds)
    : copyKeyFrameContextMenuItem(props, [props.keyframe.id])

  const deleteItem = deleteSelectionOrKeyframeContextMenuItem(props)

  return useContextMenu(target, {
    menuItems: () => {
      return [keyframeSelectionItem, deleteItem]
    },
  })
}

/** The editor that pops up when directly clicking a Keyframe. */
function useKeyframeInlineEditorPopover(props: IKeyframeDotProps) {
  const editingTools = useEditingToolsForKeyframeEditorPopover(props)
  const label = props.leaf.propConf.label ?? last(props.leaf.pathToProp)

  return usePopover({debugName: 'useKeyframeInlineEditorPopover'}, () => (
    <BasicPopover showPopoverEdgeTriangle>
      <DeterminePropEditorForKeyframe
        propConfig={props.leaf.propConf}
        editingTools={editingTools}
        keyframeValue={props.keyframe.value}
        displayLabel={label != null ? String(label) : undefined}
      />
    </BasicPopover>
  ))
}

function useEditingToolsForKeyframeEditorPopover(props: IKeyframeDotProps) {
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

function useDragForKeyframeDot(
  node: HTMLDivElement | null,
  props: IKeyframeDotProps,
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
              pathToProp: leaf.pathToProp,
              trackId: leaf.trackId,
              keyframeId: props.keyframe.id,
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

  useLockFrameStampPosition(isDragging, props.keyframe.position)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}

function deleteSelectionOrKeyframeContextMenuItem(
  props: IKeyframeDotProps,
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
  props: IKeyframeDotProps,
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
