import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
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

const SingleKeyframeEditorContainer = styled.div`
  position: absolute;
`

const noConnector = <></>

export type ISingleKeyframeEditorProps = {
  index: number
  keyframe: Keyframe
  trackData: TrackData
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: SequenceEditorTree_PrimitiveProp
  selection: undefined | DopeSheetSelection
}

const SingleKeyframeEditor: React.VFC<ISingleKeyframeEditorProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

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
      <SingleKeyframeDot {...props} />
      {connected ? <SingleKeyframeConnector {...props} /> : noConnector}
    </SingleKeyframeEditorContainer>
  )
}

export default SingleKeyframeEditor
