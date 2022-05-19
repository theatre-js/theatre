import type {TrackData} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PropWithChildren} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import getStudio from '@theatre/studio/getStudio'
import AggregateKeyframeEditor from './AggregateKeyframeEditor'
import type {KeyframeId, SequenceTrackId} from '@theatre/shared/utils/ids'
import type {AggregatedKeyframes} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'

const AggregatedKeyframeTrackContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

type IAggregatedKeyframeTracksProps = {
  viewModel: SequenceEditorTree_PropWithChildren
  aggregatedKeyframes: AggregatedKeyframes
  // TODO:
  // | SequenceEditorTree_SheetObject
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
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const {selectedPositions, selection} = useCollectedSelectedPositions(
    layoutP,
    viewModel,
    aggregatedKeyframes.tracks,
  )

  const [contextMenu, _, isOpen] = useAggregatedKeyframeTrackContextMenu(
    containerNode,
    props,
  )

  const posKfs = [...aggregatedKeyframes.byPosition.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([position, keyframes]) => ({
      position,
      keyframes,
      selected: selectedPositions.get(position),
    }))

  const keyframeEditors = posKfs.map(({position, keyframes}, index) => (
    <AggregateKeyframeEditor
      index={index}
      layoutP={layoutP}
      viewModel={viewModel}
      aggregateKeyframes={posKfs}
      key={'agg-' + position}
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
}

/** Helper to put together the selected positions */
function useCollectedSelectedPositions(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  viewModel: SequenceEditorTree_PropWithChildren,
  tracks: {id: SequenceTrackId; data: TrackData}[],
): _AggSelection {
  return usePrism(() => {
    const selectionAtom = val(layoutP.selectionAtom)
    const sheetObjectSelection = val(
      selectionAtom.pointer.current.byObjectKey[
        viewModel.sheetObject.address.objectKey
      ],
    )
    if (!sheetObjectSelection) return EMPTY_SELECTION

    // when finding a selected keyframe,
    // look for it's position, if it's not in the partially selected,
    //  * add all KeyframeIds at that position into a set at that position
    //
    // finally, remove current keyframe ID from the set

    // const unselectedAtPositions = new Map<number, Set<KeyframeId>>()
    const selectedAtPositions = new Map<
      number,
      AggregateKeyframePositionIsSelected
    >()
    const allKeyframes = new Map<
      KeyframeId,
      {kf: Keyframe; track: {id: SequenceTrackId; data: TrackData}}
    >()

    for (const t of tracks) {
      const selected = sheetObjectSelection.byTrackId[t.id]?.byKeyframeId ?? {}
      // basic keyframed
      // collect all keyframes
      for (const kf of t.data.keyframes) {
        allKeyframes.set(kf.id, {kf, track: t})
        let selectedAtPos = selectedAtPositions.get(kf.position)
        if (selectedAtPos == null && selected[kf.id]) {
          selectedAtPositions.set(
            kf.position,
            AggregateKeyframePositionIsSelected.AllSelected,
          )
        } else if (
          selectedAtPos === AggregateKeyframePositionIsSelected.AllSelected &&
          !selected[kf.id]
        ) {
          selectedAtPositions.set(
            kf.position,
            AggregateKeyframePositionIsSelected.AtLeastOneUnselected,
          )
        }
      }
    }

    return {
      selectedPositions: selectedAtPositions,
      selection: val(selectionAtom.pointer.current),
    }
  }, [layoutP])
}

function useAggregatedKeyframeTrackContextMenu(
  node: HTMLDivElement | null,
  props: IAggregatedKeyframeTracksProps,
) {
  return useContextMenu(node, {
    menuItems: () => {
      const selectionKeyframes =
        val(getStudio()!.atomP.ahistoric.clipboard.keyframes) || []

      if (selectionKeyframes.length > 0) {
        return [pasteKeyframesContextMenuItem(props, selectionKeyframes)]
      } else {
        return []
      }
    },
  })
}

function pasteKeyframesContextMenuItem(
  props: IAggregatedKeyframeTracksProps,
  keyframes: Keyframe[],
): IContextMenuItem {
  return {
    label: 'Paste Keyframes',
    callback: () => {
      const sheet = val(props.layoutP.sheet)
      const sequence = sheet.getSequence()

      console.log('TODO paste keyframes?')
      // getStudio()!.transaction(({stateEditors}) => {
      //   sequence.position = sequence.closestGridPosition(sequence.position)
      //   const keyframeOffset = earliestKeyframe(keyframes)?.position!

      //   for (const keyframe of keyframes) {
      //     stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
      //       {
      //         ...props.viewModel.sheetObject.address,
      //         trackId: props.viewModel.trackId,
      //         position: sequence.position + keyframe.position - keyframeOffset,
      //         handles: keyframe.handles,
      //         value: keyframe.value,
      //         snappingFunction: sequence.closestGridPosition,
      //       },
      //     )
      //   }
      // })
    },
  }
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
