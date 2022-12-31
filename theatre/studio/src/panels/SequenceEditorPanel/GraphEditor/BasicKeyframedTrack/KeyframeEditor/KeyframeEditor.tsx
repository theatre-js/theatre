import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceTrackId,
  StudioSheetItemKey,
} from '@theatre/shared/utils/ids'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {graphEditorColors} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import type {ExtremumSpace} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/BasicKeyframedTrack/BasicKeyframedTrack'
import Curve from './Curve'
import CurveHandle from './CurveHandle'
import GraphEditorDotScalar from './GraphEditorDotScalar'
import GraphEditorDotNonScalar from './GraphEditorDotNonScalar'
import GraphEditorNonScalarDash from './GraphEditorNonScalarDash'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'
import type {PathToProp} from '@theatre/shared/utils/addresses'

const Container = styled.g`
  /* position: absolute; */
`

const noConnector = <></>

type IKeyframeEditorProps = {
  index: number
  keyframe: Keyframe
  trackData: TrackData
  itemKey: StudioSheetItemKey
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackId: SequenceTrackId
  sheetObject: SheetObject
  pathToProp: PathToProp
  extremumSpace: ExtremumSpace
  isScalar: boolean
  color: keyof typeof graphEditorColors
  propConfig: PropTypeConfig_AllSimples
}

const KeyframeEditor: React.VFC<IKeyframeEditorProps> = (props) => {
  const {index, trackData, isScalar} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const connected = cur.connectedRight && !!next
  const shouldShowCurve = connected && next.value !== cur.value

  return (
    <Container>
      {shouldShowCurve ? (
        <>
          <Curve {...props} />
          {!cur.type ||
            (cur.type === 'bezier' && (
              <>
                <CurveHandle {...props} which="left" />
                <CurveHandle {...props} which="right" />
              </>
            ))}
        </>
      ) : (
        noConnector
      )}
      {isScalar ? (
        <GraphEditorDotScalar {...props} />
      ) : (
        <>
          <GraphEditorDotNonScalar {...props} which="left" />
          <GraphEditorDotNonScalar {...props} which="right" />
          <GraphEditorNonScalarDash {...props} />
        </>
      )}
    </Container>
  )
}

export default KeyframeEditor
