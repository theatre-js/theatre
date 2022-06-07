import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import last from 'lodash-es/last'

import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'

import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {DeterminePropEditorForSingleKeyframe} from './DeterminePropEditorForSingleKeyframe'
import type {ISingleKeyframeEditorProps} from './SingleKeyframeEditor'
import {absoluteDims} from '@theatre/studio/utils/absoluteDims'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import type {ILogger} from '@theatre/shared/logger'
import {copyableKeyframesFromSelection} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {snapPositionsB} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/SnapTarget'

export const DOT_SIZE_PX = 6
const DOT_HOVER_SIZE_PX = DOT_SIZE_PX + 5

const dotTheme = {
  normalColor: '#40AAA4',
  selectedColor: '#F2C95C',
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

  position: absolute;
  ${absoluteDims(12)};
  ${pointerEventsAutoInNormalMode};

  &:hover + ${Diamond} {
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
      <HitZone ref={ref} />
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
  return useContextMenu(target, {
    displayName: 'Keyframe',
    menuItems: () => {
      const copyableKeyframes = copyableKeyframesFromSelection(
        props.leaf.sheetObject.address.projectId,
        props.leaf.sheetObject.address.sheetId,
        props.selection,
      )

      return [
        {
          label: copyableKeyframes.length > 0 ? 'Copy (selection)' : 'Copy',
          callback: () => {
            if (copyableKeyframes.length > 0) {
              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  copyableKeyframes,
                )
              })
            } else {
              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes([
                  {keyframe: props.keyframe, pathToProp: props.leaf.pathToProp},
                ])
              })
            }
          },
        },
        {
          label:
            props.selection !== undefined ? 'Delete (selection)' : 'Delete',
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
        },
      ]
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

        const tracksByObject = val(
          getStudio()!.atomP.historic.coreByProject[
            props.leaf.sheetObject.address.projectId
          ].sheetsById[props.leaf.sheetObject.address.sheetId].sequence
            .tracksByObject,
        )!

        // Calculate all the valid snap positions in the sequence editor,
        // excluding this keyframe, and any selection it is part of.
        const snapPositions = Object.fromEntries(
          Object.entries(tracksByObject).map(([objectKey, value]) => [
            objectKey,
            Object.fromEntries(
              Object.entries(value!.trackData).map(([trackId, value]) => [
                trackId,
                value!.keyframes
                  .filter(
                    (keyframe) =>
                      keyframe.id !== props.keyframe.id &&
                      !(
                        props.selection &&
                        props.selection.byObjectKey[objectKey]?.byTrackId[
                          trackId
                        ]?.byKeyframeId[keyframe.id]
                      ),
                  )
                  .map((keyframe) => keyframe.position),
              ]),
            ),
          ]),
        )

        snapPositionsB.set(snapPositions)

        if (props.selection) {
          const {selection, leaf} = props
          const {sheetObject} = leaf
          const handlers = selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag:
                props.trackData.keyframes[props.index].position,
            })
            .onDragStart(event)

          // this opens the regular inline keyframe editor on click.
          // in the future, we may want to show an multi-editor, like in the
          // single tween editor, so that selected keyframes' values can be changed
          // together
          return (
            handlers && {
              ...handlers,
              onClick: options.onClickFromDrag,
              onDragEnd: (...args) => {
                handlers.onDragEnd?.(...args)
                snapPositionsB.set({})
              },
            }
          )
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
            }

            snapPositionsB.set({})
          },
          onClick(ev) {
            options.onClickFromDrag(ev)
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
