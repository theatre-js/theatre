import React, {useState} from 'react'
import type {TrackData} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'
import type {StrictRecord} from '@theatre/shared/utils/types'
import isEqual from 'lodash-es/isEqual'

const BasicKeyframedTrack: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: TrackData
}> = React.memo(({layoutP, trackData, leaf}) => {
  const [selection, setSelection] = useState<undefined | DopeSheetSelection>(
    undefined,
  )
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<
    undefined | StrictRecord<string, true>
  >({})

  usePrism(() => {
    const selectionAtom = val(layoutP.selectionAtom)
    const newSelectedKeyframeIds =
      val(
        selectionAtom.pointer.current.byObjectKey[
          leaf.sheetObject.address.objectKey
        ].byTrackId[leaf.trackId].byKeyframeId,
      ) || {}

    // Only update these objects when selectedKeyframeIds change
    if (!isEqual(selectedKeyframeIds, newSelectedKeyframeIds)) {
      setSelectedKeyframeIds(newSelectedKeyframeIds)
      setSelection(val(selectionAtom.pointer.current) || undefined)
    }
  }, [layoutP, leaf.trackId, selection, selectedKeyframeIds])

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

  return <>{keyframeEditors}</>
})

export default BasicKeyframedTrack
