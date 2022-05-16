import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import getStudio from '@theatre/studio/getStudio'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import KeyframedTrack from './BasicKeyframedTrack/BasicKeyframedTrack'
import RightRow from './Row'

const PrimitivePropRow: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const {sheetObject} = leaf
    const {trackId} = leaf

    const trackData = val(
      getStudio()!.atomP.historic.coreByProject[sheetObject.address.projectId]
        .sheetsById[sheetObject.address.sheetId].sequence.tracksByObject[
        sheetObject.address.objectKey
      ].trackData[trackId],
    )

    if (trackData?.type !== 'BasicKeyframedTrack') {
      console.error(
        `trackData type ${trackData?.type} is not yet supported on the sequence editor`,
      )
      return <RightRow leaf={leaf} node={<div />}></RightRow>
    } else {
      const node = (
        <KeyframedTrack layoutP={layoutP} trackData={trackData} leaf={leaf} />
      )

      return <RightRow leaf={leaf} node={node}></RightRow>
    }
  }, [leaf, layoutP])
}

export default PrimitivePropRow
