import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism, useVal} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {prism, val, valueDerivation} from '@theatre/dataverse'
import React, {useMemo, Fragment} from 'react'
import styled from 'styled-components'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {
  IAggregateKeyframesAtPosition,
  IAggregateKeyframeEditorProps,
} from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import AggregateKeyframeEditor from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import type {AggregatedKeyframes} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import {getAggregateKeyframeEditorUtilsPrismFn} from './AggregateKeyframeEditor/useAggregateKeyframeEditorUtils'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {useLockFrameStampPositionRef} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCssCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import getStudio from '@theatre/studio/getStudio'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import {
  decodePathToProp,
  doesPathStartWith,
  encodePathToProp,
} from '@theatre/shared/utils/addresses'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type Sequence from '@theatre/core/sequences/Sequence'
import KeyframeSnapTarget, {
  snapPositionsStateD,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {emptyObject} from '@theatre/shared/utils'
import type {KeyframeWithPathToPropFromCommonRoot} from '@theatre/studio/store/types'
import {
  collectKeyframeSnapPositions,
  snapToNone,
  snapToSome,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {collectAggregateSnapPositions} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'

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

  const posKfs: IAggregateKeyframesAtPosition[] = useMemo(
    () =>
      [...aggregatedKeyframes.byPosition.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(
          ([position, keyframes]): IAggregateKeyframesAtPosition => ({
            position,
            keyframes,
            selected: selectedPositions.get(position),
            allHere: keyframes.length === aggregatedKeyframes.tracks.length,
          }),
        ),
    [aggregatedKeyframes, selectedPositions],
  )

  const snapPositionsState = useVal(snapPositionsStateD)

  const snapToAllKeyframes = snapPositionsState.mode === 'snapToAll'

  const snapPositions =
    snapPositionsState.mode === 'snapToSome'
      ? snapPositionsState.positions
      : emptyObject

  const aggregateSnapPositions = useMemo(
    () => collectAggregateSnapPositions(viewModel, snapPositions),
    [snapPositions],
  )

  const snapTargets = aggregateSnapPositions.map((position) => (
    <KeyframeSnapTarget
      key={'snap-target-' + position}
      layoutP={layoutP}
      leaf={viewModel}
      position={position}
    />
  ))

  const keyframeEditorProps = useMemo(
    () =>
      posKfs.map(
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
      ),
    [posKfs, viewModel, selectedPositions],
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
    <Fragment key={'agg-' + posKfs[i].keyframes[0].kf.id}>
      {snapToAllKeyframes && (
        <KeyframeSnapTarget
          layoutP={layoutP}
          leaf={viewModel}
          position={props.position}
        />
      )}
      <AggregateKeyframeEditor {...props.editorProps} />
    </Fragment>
  ))

  return (
    <AggregatedKeyframeTrackContainer
      ref={containerRef}
      style={{
        background: isOpen ? '#444850 ' : 'unset',
      }}
    >
      {keyframeEditors}
      {snapTargets}
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
      const selectionKeyframes =
        valueDerivation(
          getStudio()!.atomP.ahistoric.clipboard.keyframesWithRelativePaths,
        ).getValue() ?? []

      return [pasteKeyframesContextMenuItem(props, selectionKeyframes)]
    },
  })
}

function pasteKeyframesContextMenuItem(
  props: IAggregatedKeyframeTracksProps,
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
): IContextMenuItem {
  return {
    label: 'Paste Keyframes',
    enabled: keyframes.length > 0,
    callback: () => {
      const sheet = val(props.layoutP.sheet)
      const sequence = sheet.getSequence()

      pasteKeyframes(props.viewModel, keyframes, sequence)
    },
  }
}

/**
 * Given a list of keyframes that contain paths relative to a common root,
 * (see `copyableKeyframesFromSelection`) this function pastes those keyframes
 * into tracks on either the object (if viewModel.type === 'sheetObject') or
 * the compound prop (if viewModel.type === 'propWithChildren').
 *
 * Our copy & paste behavior is currently roughly described in AGGREGATE_COPY_PASTE.md
 *
 * @see StudioAhistoricState.clipboard
 * @see setClipboardNestedKeyframes
 */
function pasteKeyframes(
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject,
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
  sequence: Sequence,
) {
  const {projectId, sheetId, objectKey} = viewModel.sheetObject.address

  const tracksByObject = valueDerivation(
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[sheetId]
      .sequence.tracksByObject[objectKey],
  ).getValue()

  const areKeyframesAllOnSingleTrack = keyframes.every(
    ({pathToProp}) => pathToProp.length === 0,
  )

  if (areKeyframesAllOnSingleTrack) {
    const trackIdsOnObject = Object.keys(tracksByObject?.trackData ?? {})

    if (viewModel.type === 'sheetObject') {
      pasteKeyframesToMultipleTracks(
        viewModel.sheetObject.address,
        trackIdsOnObject,
        keyframes,
        sequence,
      )
    } else {
      const trackIdByPropPath = tracksByObject?.trackIdByPropPath || {}

      const trackIdsOnCompoundProp = Object.entries(trackIdByPropPath)
        .filter(
          ([encodedPath, trackId]) =>
            trackId !== undefined &&
            doesPathStartWith(
              // e.g. a track with path `['position', 'x']` is under the compound track with path `['position']`
              decodePathToProp(encodedPath),
              viewModel.pathToProp,
            ),
        )
        .map(([encodedPath, trackId]) => trackId) as SequenceTrackId[]

      pasteKeyframesToMultipleTracks(
        viewModel.sheetObject.address,
        trackIdsOnCompoundProp,
        keyframes,
        sequence,
      )
    }
  } else {
    const trackIdByPropPath = tracksByObject?.trackIdByPropPath || {}

    const rootPath =
      viewModel.type === 'propWithChildren' ? viewModel.pathToProp : []

    const placeableKeyframes = keyframes
      .map(({keyframe, pathToProp: relativePathToProp}) => {
        const pathToPropEncoded = encodePathToProp([
          ...rootPath,
          ...relativePathToProp,
        ])

        const maybeTrackId = trackIdByPropPath[pathToPropEncoded]

        return maybeTrackId
          ? {
              keyframe,
              trackId: maybeTrackId,
            }
          : null
      })
      .filter((result) => result !== null) as {
      keyframe: Keyframe
      trackId: SequenceTrackId
    }[]

    pasteKeyframesToSpecificTracks(
      viewModel.sheetObject.address,
      placeableKeyframes,
      sequence,
    )
  }
}

function pasteKeyframesToMultipleTracks(
  address: SheetObjectAddress,
  trackIds: SequenceTrackId[],
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
  sequence: Sequence,
) {
  sequence.position = sequence.closestGridPosition(sequence.position)
  const keyframeOffset = earliestKeyframe(
    keyframes.map(({keyframe}) => keyframe),
  )?.position!

  getStudio()!.transaction(({stateEditors}) => {
    for (const trackId of trackIds) {
      for (const {keyframe} of keyframes) {
        stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
          {
            ...address,
            trackId,
            position: sequence.position + keyframe.position - keyframeOffset,
            handles: keyframe.handles,
            value: keyframe.value,
            snappingFunction: sequence.closestGridPosition,
          },
        )
      }
    }
  })
}

function pasteKeyframesToSpecificTracks(
  address: SheetObjectAddress,
  keyframesWithTracksToPlaceThemIn: {
    keyframe: Keyframe
    trackId: SequenceTrackId
  }[],
  sequence: Sequence,
) {
  sequence.position = sequence.closestGridPosition(sequence.position)
  const keyframeOffset = earliestKeyframe(
    keyframesWithTracksToPlaceThemIn.map(({keyframe}) => keyframe),
  )?.position!

  getStudio()!.transaction(({stateEditors}) => {
    for (const {keyframe, trackId} of keyframesWithTracksToPlaceThemIn) {
      stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
        {
          ...address,
          trackId,
          position: sequence.position + keyframe.position - keyframeOffset,
          handles: keyframe.handles,
          value: keyframe.value,
          snappingFunction: sequence.closestGridPosition,
        },
      )
    }
  })
}

function earliestKeyframe(keyframes: Keyframe[]) {
  let curEarliest: Keyframe | null = null
  for (const keyframe of keyframes) {
    if (curEarliest === null || keyframe.position < curEarliest.position) {
      curEarliest = keyframe
    }
  }
  return curEarliest
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

        const tracksByObject = val(
          getStudio()!.atomP.historic.coreByProject[
            props.viewModel.sheetObject.address.projectId
          ].sheetsById[props.viewModel.sheetObject.address.sheetId].sequence
            .tracksByObject,
        )!

        // Calculate all the valid snap positions in the sequence editor,
        // excluding the child keyframes of this aggregate, and any selection it is part of.
        const snapPositions = collectKeyframeSnapPositions(
          tracksByObject,
          function shouldIncludeKeyfram(keyframe, {trackId, objectKey}) {
            return (
              // we exclude all the child keyframes of this aggregate keyframe from being a snap target
              keyframes.every(
                (kfWithTrack) => keyframe.id !== kfWithTrack.kf.id,
              ) &&
              !(
                // if all of the children of the current aggregate keyframe are in a selection,
                (
                  props.selection &&
                  // then we exclude them and all other keyframes in the selection from being snap targets
                  props.selection.byObjectKey[objectKey]?.byTrackId[trackId]
                    ?.byKeyframeId[keyframe.id]
                )
              )
            )
          },
        )

        snapToSome(snapPositions)

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
              domNode: containerNode!,
              positionAtStartOfDrag: keyframes[0].kf.position,
            })
            .onDragStart(event)

          return (
            handlers && {
              ...handlers,
              onClick: options.onClickFromDrag,
              onDragEnd: (...args) => {
                handlers.onDragEnd?.(...args)
                snapToNone()
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

            snapToNone()
          },
          onClick(ev) {
            options.onClickFromDrag(ev)
          },
        }
      },
    }
  }, [getPropsForPosition, options.onClickFromDrag])

  const [isDragging] = useDrag(containerNode, useDragOpts)

  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}
