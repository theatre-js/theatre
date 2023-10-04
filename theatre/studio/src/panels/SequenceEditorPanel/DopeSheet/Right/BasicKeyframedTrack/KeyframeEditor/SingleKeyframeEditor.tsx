import type {Keyframe} from '@theatre/sync-server/state/types/core'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import SingleKeyframeConnector from './BasicKeyframeConnector'
import SingleKeyframeDot from './SingleKeyframeDot'
import type {TrackWithId} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {StudioSheetItemKey} from '@theatre/sync-server/state/types'
import {keyframeUtils} from '@theatre/sync-server/state/schema'

const SingleKeyframeEditorContainer = styled.div`
  position: absolute;
`

const noConnector = <></>

export type ISingleKeyframeEditorProps = {
  index: number
  keyframe: Keyframe
  track: TrackWithId
  itemKey: StudioSheetItemKey
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: SequenceEditorTree_PrimitiveProp
  selection: undefined | DopeSheetSelection
}

const SingleKeyframeEditor: React.VFC<ISingleKeyframeEditorProps> = React.memo(
  (props) => {
    const {
      index,
      track: {data: trackData},
    } = props
    const cur = keyframeUtils.getSortedKeyframesCached(trackData.keyframes)[
      index
    ]
    const next = keyframeUtils.getSortedKeyframesCached(trackData.keyframes)[
      index + 1
    ]

    const connected = cur.connectedRight && !!next

    return (
      <SingleKeyframeEditorContainer
        style={{
          top: `${props.leaf.nodeHeight / 2}px`,
          left: `calc(${val(
            props.layoutP.scaledSpace.leftPadding,
          )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
            cur.position
          }px))`,
        }}
      >
        <SingleKeyframeDot {...props} itemKey={props.itemKey} />
        {connected ? <SingleKeyframeConnector {...props} /> : noConnector}
      </SingleKeyframeEditorContainer>
    )
  },
)

export default SingleKeyframeEditor
