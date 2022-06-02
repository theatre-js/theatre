import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {valueDerivation} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {IAggregateKeyframesAtPosition} from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import AggregateKeyframeEditor from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import type {AggregatedKeyframes} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import getStudio from '@theatre/studio/getStudio'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type Sequence from '@theatre/core/sequences/Sequence'
import type {KeyframeWithPathToPropFromCommonRoot} from '@theatre/studio/store/types'

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

  const keyframeEditors = posKfs.map(({position, keyframes}, index) => (
    <AggregateKeyframeEditor
      index={index}
      layoutP={layoutP}
      viewModel={viewModel}
      aggregateKeyframes={posKfs}
      // To ensure that while dragging, we don't lose reference to the
      // aggregate we're trying to drag.
      key={'agg-' + keyframes[0].kf.id}
      selection={
        selectedPositions.has(position) === true ? selection : undefined
      }
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
 * Our copy & paste behaviour is currently roughly described in AGGREGATE_COPY_PASTE.md
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

  sequence.position = sequence.closestGridPosition(sequence.position)
  const keyframeOffset = earliestKeyframe(
    placeableKeyframes.map(({keyframe}) => keyframe),
  )?.position!

  getStudio()!.transaction(({stateEditors}) => {
    for (const {keyframe, trackId} of placeableKeyframes) {
      stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
        {
          ...viewModel.sheetObject.address,
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
