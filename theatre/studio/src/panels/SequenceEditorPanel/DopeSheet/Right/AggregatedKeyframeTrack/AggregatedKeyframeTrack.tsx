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
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {IAggregateKeyframesAtPosition} from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import AggregateKeyframeEditor from './AggregateKeyframeEditor/AggregateKeyframeEditor'
import type {AggregatedKeyframes} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'

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
      return []
    },
  })
}
