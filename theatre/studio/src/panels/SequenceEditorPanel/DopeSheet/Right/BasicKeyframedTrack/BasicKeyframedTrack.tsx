import type {TrackData} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import getStudio from '@theatre/studio/getStudio'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

type BasicKeyframedTracksProps = {
  leaf: SequenceEditorTree_PrimitiveProp
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: TrackData
}

const BasicKeyframedTrack: React.FC<BasicKeyframedTracksProps> = React.memo(
  (props) => {
    const {layoutP, trackData, leaf} = props
    const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
      null,
    )
    const {selectedKeyframeIds, selection} = usePrism(() => {
      const selectionAtom = val(layoutP.selectionAtom)
      const selectedKeyframeIds = val(
        selectionAtom.pointer.current.byObjectKey[
          leaf.sheetObject.address.objectKey
        ].byTrackId[leaf.trackId].byKeyframeId,
      )
      if (selectedKeyframeIds) {
        return {
          selectedKeyframeIds,
          selection: val(selectionAtom.pointer.current),
        }
      } else {
        return {
          selectedKeyframeIds: {},
          selection: undefined,
        }
      }
    }, [layoutP, leaf.trackId])

    const [contextMenu, _, isOpen] = useBasicKeyframedTrackContextMenu(
      containerNode,
      props,
    )

    const keyframeEditors = trackData.keyframes.map((kf, index) => (
      <KeyframeEditor
        keyframe={kf}
        index={index}
        trackData={trackData}
        layoutP={layoutP}
        leaf={leaf}
        key={'keyframe-' + kf.id}
        selection={selectedKeyframeIds[kf.id] === true ? selection : undefined}
      />
    ))

    return (
      <Container
        ref={containerRef}
        style={{
          background: isOpen ? '#444850 ' : 'unset',
        }}
      >
        {keyframeEditors}
        {contextMenu}
      </Container>
    )
  },
)

export default BasicKeyframedTrack

function useBasicKeyframedTrackContextMenu(
  node: HTMLDivElement | null,
  props: BasicKeyframedTracksProps,
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
  props: BasicKeyframedTracksProps,
  keyframes: Keyframe[],
): IContextMenuItem {
  return {
    label: 'Paste Keyframes',
    callback: () => {
      const sheet = val(props.layoutP.sheet)
      const sequence = sheet.getSequence()

      getStudio()!.transaction(({stateEditors}) => {
        sequence.position = sequence.closestGridPosition(sequence.position)
        const keyframeOffset = earliestKeyframe(keyframes)?.position!

        for (const keyframe of keyframes) {
          stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
            {
              ...props.leaf.sheetObject.address,
              trackId: props.leaf.trackId,
              position: sequence.position + keyframe.position - keyframeOffset,
              handles: keyframe.handles,
              value: keyframe.value,
              snappingFunction: sequence.closestGridPosition,
            },
          )
        }
      })
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
