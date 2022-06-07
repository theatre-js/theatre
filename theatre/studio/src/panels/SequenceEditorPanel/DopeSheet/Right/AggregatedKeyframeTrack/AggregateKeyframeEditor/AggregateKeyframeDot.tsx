import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
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
import {
  copyableKeyframesFromSelection,
  keyframesWithPaths,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import type {KeyframeWithPathToPropFromCommonRoot} from '@theatre/studio/store/types/ahistoric'
import {commonRootOfPathsToProps} from '@theatre/shared/utils/addresses'
import type {ILogger} from '@theatre/shared/logger'
import {snapPositionsB} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/SnapTarget'

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

  const [contextMenu] = useAggregateKeyframeContextMenu(props, logger, node)

  return (
    <>
      <HitZone ref={ref} />
      <AggregateKeyframeVisualDot
        isAllHere={cur.allHere}
        isSelected={cur.selected}
      />
      {contextMenu}
    </>
  )
}

function useAggregateKeyframeContextMenu(
  props: IAggregateKeyframeDotProps,
  logger: ILogger,
  target: HTMLDivElement | null,
) {
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      // see AGGREGATE_COPY_PASTE.md for explanation of this
      // code that makes some keyframes with paths for copying
      // to clipboard
      const kfs = props.utils.cur.keyframes.reduce(
        (acc, kfWithTrack) =>
          acc.concat(
            keyframesWithPaths({
              ...props.editorProps.viewModel.sheetObject.address,
              trackId: kfWithTrack.track.id,
              keyframeIds: [kfWithTrack.kf.id],
            }) ?? [],
          ),
        [] as KeyframeWithPathToPropFromCommonRoot[],
      )

      const commonPath = commonRootOfPathsToProps(
        kfs.map((kf) => kf.pathToProp),
      )

      const keyframesWithCommonRootPath = kfs.map(({keyframe, pathToProp}) => ({
        keyframe,
        pathToProp: pathToProp.slice(commonPath.length),
      }))

      return [
        {
          label: props.editorProps.selection ? 'Copy (selection)' : 'Copy',
          callback: () => {
            if (props.editorProps.selection) {
              const copyableKeyframes = copyableKeyframesFromSelection(
                props.editorProps.viewModel.sheetObject.address.projectId,
                props.editorProps.viewModel.sheetObject.address.sheetId,
                props.editorProps.selection,
              )
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  copyableKeyframes,
                )
              })
            } else {
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  keyframesWithCommonRootPath,
                )
              })
            }
          },
        },
        {
          label: props.editorProps.selection ? 'Delete (selection)' : 'Delete',
          callback: () => {
            if (props.editorProps.selection) {
              props.editorProps.selection.delete()
            } else {
              getStudio().transaction(({stateEditors}) => {
                for (const kfWithTrack of props.utils.cur.keyframes) {
                  stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                    {
                      ...props.editorProps.viewModel.sheetObject.address,
                      keyframeIds: [kfWithTrack.kf.id],
                      trackId: kfWithTrack.track.id,
                    },
                  )
                }
              })
            }
          },
        },
      ]
    },
    onOpen() {
      logger._debug('Show aggregate keyframe', props)
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

        const tracksByObject = val(
          getStudio()!.atomP.historic.coreByProject[
            props.viewModel.sheetObject.address.projectId
          ].sheetsById[props.viewModel.sheetObject.address.sheetId].sequence
            .tracksByObject,
        )!

        // Calculate all the valid snap positions in the sequence editor,
        // excluding the child keyframes of this aggregate, and any selection it is part of.
        const snapPositions = Object.fromEntries(
          Object.entries(tracksByObject).map(([key, value]) => [
            key,
            Object.fromEntries(
              Object.entries(value!.trackData).map(([key, value]) => [
                key,
                value!.keyframes
                  .filter(
                    (keyframe) =>
                      keyframes.every(
                        (kfWithTrack) => keyframe.id !== kfWithTrack.kf.id,
                      ) &&
                      !(
                        props.selection &&
                        props.selection.byObjectKey[
                          props.viewModel.sheetObject.address.objectKey
                        ]?.byTrackId[key]?.byKeyframeId[keyframe.id]
                      ),
                  )
                  .map((keyframe) => keyframe.position),
              ]),
            ),
          ]),
        )

        snapPositionsB.set(snapPositions)

        if (
          props.selection &&
          props.aggregateKeyframes[props.index].selected ===
            AggregateKeyframePositionIsSelected.AllSelected
        ) {
          const {selection, viewModel} = props
          const {sheetObject} = viewModel
          const handlers = selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag: keyframes[0].kf.position,
            })
            .onDragStart(event)

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

  useLockFrameStampPosition(isDragging, props.utils.cur.position)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}
