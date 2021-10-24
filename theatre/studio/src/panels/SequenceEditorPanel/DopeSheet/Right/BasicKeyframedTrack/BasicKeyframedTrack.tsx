import type {TrackData} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'

const Container = styled.div``

const BasicKeyframedTrack: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp

  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: TrackData<unknown>
}> = React.memo(({layoutP, trackData, leaf}) => {
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
      selection={selectedKeyframeIds[kf.id] === true ? selection : undefined}
    />
  ))

  return <>{keyframeEditors}</>
})

export default BasicKeyframedTrack
