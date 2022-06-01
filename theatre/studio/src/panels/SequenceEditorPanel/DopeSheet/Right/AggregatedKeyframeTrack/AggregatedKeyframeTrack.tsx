import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {IAggregateKeyframesAtPosition,
  IAggregateKeyframeEditorProps,
} from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import AggregateKeyframeEditor from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import type {AggregatedKeyframes} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import {getAggregateKeyframeEditorUtilsPrismFn} from './AggregateKeyframeEditor/useAggregateKeyframeEditorUtils'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import getStudio from '@theatre/studio/getStudio'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {useLockFrameStampPositionRef} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'

const AggregatedKeyframeTrackContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

type IAggregatedKeyframeTracksProps = {
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject
  aggregatedKeyframes: AggregatedKeyframes
  layoutP: Pointer<SequenceEditorPanelLayout>
}

type _AggSelection = {
  selectedPositions: Map<number, AggregateKeyframePositionIsSelected>
  selection: DopeSheetSelection | undefined
}

const EMPTY_SELECTION: _AggSelection = Object.freeze({
  selectedPositions: new Map(),
  selection: undefined,
})

function AggregatedKeyframeTrack_memo(props: IAggregatedKeyframeTracksProps) {
  const {layoutP, aggregatedKeyframes, viewModel} = props
  const logger = useLogger('AggregatedKeyframeTrack')
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const {selectedPositions, selection} = useCollectedSelectedPositions(
    layoutP,
    viewModel,
    aggregatedKeyframes,
  )

  const [contextMenu, _, isOpen] = useAggregatedKeyframeTrackContextMenu(
    containerNode,
    props,
    () => logger._debug('see aggregatedKeyframes', props.aggregatedKeyframes),
  )

  const posKfs: IAggregateKeyframesAtPosition[] = [
    ...aggregatedKeyframes.byPosition.entries(),
  ]
    .sort((a, b) => a[0] - b[0])
    .map(
      ([position, keyframes]): IAggregateKeyframesAtPosition => ({
        position,
        keyframes,
        selected: selectedPositions.get(position),
        allHere: keyframes.length === aggregatedKeyframes.tracks.length,
      }),
    )

  const keyframeEditorProps = posKfs.map(
    (
      {position, keyframes},
      index,
    ): {editorProps: IAggregateKeyframeEditorProps; position: number} => ({
      position,
      editorProps: {
        index,
        layoutP,
        viewModel,
        aggregateKeyframes: posKfs,
        selection: selectedPositions.has(position) ? selection : undefined,
      },
    }),
  )

  const [isDragging] = useDragForAggregateKeyframeDot(
    containerNode,
    (position) => {
      return keyframeEditorProps.find(
        (editorProp) => editorProp.position === position,
      )?.editorProps
    },
    {
      onClickFromDrag(dragStartEvent) {
        // TODO Aggregate inline keyframe editor
        // openEditor(dragStartEvent, ref.current!)
      },
    },
  )

  const keyframeEditors = keyframeEditorProps.map((props, i) => (
    <AggregateKeyframeEditor
      {...props.editorProps}
      key={'agg-' + posKfs[i].keyframes[0].kf.id}
    />
  ))

  return (
    <AggregatedKeyframeTrackContainer
      ref={containerRef}
      style={{
        background: isOpen ? '#444850 ' : 'unset',
      }}
    >
      {keyframeEditors}
      {contextMenu}
    </AggregatedKeyframeTrackContainer>
  )
}

const AggregatedKeyframeTrack = React.memo(AggregatedKeyframeTrack_memo)
export default AggregatedKeyframeTrack

export enum AggregateKeyframePositionIsSelected {
  AllSelected,
  AtLeastOneUnselected,
  NoneSelected,
}

const {AllSelected, AtLeastOneUnselected, NoneSelected} =
  AggregateKeyframePositionIsSelected

/** Helper to put together the selected positions */
function useCollectedSelectedPositions(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject,
  aggregatedKeyframes: AggregatedKeyframes,
): _AggSelection {
  return usePrism(() => {
    const selectionAtom = val(layoutP.selectionAtom)
    const sheetObjectSelection = val(
      selectionAtom.pointer.current.byObjectKey[
        viewModel.sheetObject.address.objectKey
      ],
    )
    if (!sheetObjectSelection) return EMPTY_SELECTION

    const selectedAtPositions = new Map<
      number,
      AggregateKeyframePositionIsSelected
    >()

    for (const [position, kfsWithTrack] of aggregatedKeyframes.byPosition) {
      let positionIsSelected: undefined | AggregateKeyframePositionIsSelected =
        undefined
      for (const kfWithTrack of kfsWithTrack) {
        const kfIsSelected =
          sheetObjectSelection.byTrackId[kfWithTrack.track.id]?.byKeyframeId?.[
            kfWithTrack.kf.id
          ] === true
        // -1/10: This sux
        // undefined = have not encountered
        if (positionIsSelected === undefined) {
          // first item
          if (kfIsSelected) {
            positionIsSelected = AllSelected
          } else {
            positionIsSelected = NoneSelected
          }
        } else if (kfIsSelected) {
          if (positionIsSelected === NoneSelected) {
            positionIsSelected = AtLeastOneUnselected
          }
        } else {
          if (positionIsSelected === AllSelected) {
            positionIsSelected = AtLeastOneUnselected
          }
        }
      }

      if (positionIsSelected != null) {
        selectedAtPositions.set(position, positionIsSelected)
      }
    }

    return {
      selectedPositions: selectedAtPositions,
      selection: val(selectionAtom.pointer.current),
    }
  }, [layoutP, aggregatedKeyframes])
}

function useAggregatedKeyframeTrackContextMenu(
  node: HTMLDivElement | null,
  props: IAggregatedKeyframeTracksProps,
  debugOnOpen: () => void,
) {
  return useContextMenu(node, {
    onOpen: debugOnOpen,
    displayName: 'Aggregate Keyframe Track',
    menuItems: () => {
      return []
    },
  })
}

function useDragForAggregateKeyframeDot(
  containerNode: HTMLDivElement | null,
  getPropsForPosition: (
    position: number,
  ) => IAggregateKeyframeEditorProps | undefined,
  options: {
    /**
     * hmm: this is a hack so we can actually receive the
     * {@link MouseEvent} from the drag event handler and use
     * it for positioning the popup.
     */
    onClickFromDrag(dragStartEvent: MouseEvent): void
  },
): [isDragging: boolean] {
  const logger = useLogger('useDragForAggregateKeyframeDot')
  const frameStampLock = useLockFrameStampPositionRef()
  const useDragOpts = useMemo<UseDragOpts>(() => {
    return {
      debugName: 'AggregateKeyframeDot/useDragKeyframe',
      onDragStart(event) {
        logger._debug('onDragStart', {target: event.target})
        const positionToFind = Number((event.target as HTMLElement).dataset.pos)
        const props = getPropsForPosition(positionToFind)
        if (!props) {
          logger._debug('no props found for ', {positionToFind})
          return false
        }

        frameStampLock(true, positionToFind)
        const keyframes = prism(
          getAggregateKeyframeEditorUtilsPrismFn(props),
        ).getValue().cur.keyframes

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
              domNode: containerNode!,
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
              // check if our event hovers over a [data-pos] element
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                // ignore: node,
              }) ??
                // if we don't find snapping target, check the distance dragged + original position
                keyframes[0].kf.position + toUnitSpace(dx),
              // sanitize to minimum of zero
              0,
            )

            frameStampLock(true, newPosition)

            tempTransaction?.discard()
            tempTransaction = undefined
            tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
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
            frameStampLock(false, -1)
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
  }, [getPropsForPosition, options.onClickFromDrag])

  const [isDragging] = useDrag(containerNode, useDragOpts)

  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}
