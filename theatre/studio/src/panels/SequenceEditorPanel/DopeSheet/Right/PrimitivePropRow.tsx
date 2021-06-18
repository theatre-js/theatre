import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import getStudio from '@theatre/studio/getStudio'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import BasicKeyframedTrack from './BasicKeyframedTrack/BasicKeyframedTrack'
import Row from './Row'

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
      return <Row leaf={leaf} node={<div />}></Row>
    } else {
      const node = (
        <BasicKeyframedTrack
          layoutP={layoutP}
          trackData={trackData}
          leaf={leaf}
        />
      )
      return <Row leaf={leaf} node={node}></Row>
    }
  }, [leaf, layoutP])
}

export default PrimitivePropRow
