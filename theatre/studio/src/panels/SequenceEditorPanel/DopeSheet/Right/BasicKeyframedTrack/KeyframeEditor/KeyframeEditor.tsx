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
import React from 'react'
import styled from 'styled-components'
import Connector from './Connector'
import Dot from './Dot'

const Container = styled.div`
  position: absolute;
`

const noConnector = <></>

const KeyframeEditor: React.FC<{
  index: number
  keyframe: Keyframe
  trackData: TrackData
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: SequenceEditorTree_PrimitiveProp
  selection: undefined | DopeSheetSelection
}> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const connected = cur.connectedRight && !!next

  return (
    <Container
      style={{
        top: `${props.leaf.nodeHeight / 2}px`,
        left: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${cur.position}px)`,
      }}
    >
      <Dot {...props} />
      {connected ? <Connector {...props} /> : noConnector}
    </Container>
  )
}

export default KeyframeEditor
