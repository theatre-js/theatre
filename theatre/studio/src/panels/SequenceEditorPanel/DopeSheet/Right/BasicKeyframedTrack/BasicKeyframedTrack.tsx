import React, {useEffect, useMemo} from 'react'
import styled from 'styled-components'
import type {TrackData} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useTrackHighlightProvider} from '@theatre/studio/panels/SequenceEditorPanel/TrackHighlightProvider'
import {getContextMenuItemForPasteKeyframes} from '@theatre/studio/uiComponents/simpleContextMenu/getCopyPasteKeyframesItem'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {getCopiedKeyframes} from '@theatre/studio/selectors'

const TrackContainer = styled.div<{highlight: boolean}>`
  height: 100%;
  position: relative;
  background: ${(props) => (props.highlight ? '#7a22221f' : 'transparent')};
`

const BasicKeyframedTrack: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: TrackData
}> = React.memo(({layoutP, trackData, leaf}) => {
  const {trackId} = leaf
  const {trackToHighlightId, setTrackToHighlightId} =
    useTrackHighlightProvider()
  const [ref, refNode] = useRefAndState<HTMLDivElement | null>(null)
  const [contextMenu, , isOpen] = useTrackContextMenu(refNode, {
    leaf,
  })

  useEffect(() => {
    if (trackId && isOpen) {
      setTrackToHighlightId(trackId)
    } else {
      setTrackToHighlightId(undefined)
    }
  }, [trackId, isOpen])

  // TODO: Prevent the rerenders this causes when selecting keyframes
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
      return {selectedKeyframeIds: {}, selection: undefined}
    }
  }, [layoutP, leaf.trackId])

  const keyframeEditors = trackData.keyframes.map((kf, index) => (
    <KeyframeEditor
      keyframe={kf}
      index={index}
      trackData={trackData}
      layoutP={layoutP}
      leaf={leaf}
      key={'keyframe-' + kf.id}
      selection={selectedKeyframeIds?.[kf.id] === true ? selection : undefined}
    />
  ))

  return (
    <TrackContainer
      ref={ref}
      highlight={Boolean(trackId && trackToHighlightId === trackId)}
    >
      {contextMenu}
      {keyframeEditors}
    </TrackContainer>
  )
})

function useTrackContextMenu(
  node: HTMLDivElement | null,
  {
    leaf,
  }: {
    leaf: SequenceEditorTree_PrimitiveProp
  },
) {
  const copiedKeyframes = getCopiedKeyframes()
  const pasteKeyframesItem = useMemo(
    () => getContextMenuItemForPasteKeyframes(leaf, copiedKeyframes),
    [leaf, copiedKeyframes],
  )

  return useContextMenu(node, {
    items: () => {
      if (pasteKeyframesItem) {
        return [pasteKeyframesItem]
      }
      return []
    },
  })
}

export default BasicKeyframedTrack
