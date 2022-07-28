import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import LengthIndicator from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/LengthIndicator/LengthIndicator'
import FrameStamp from './FrameStamp'
import HorizontalScrollbar from './HorizontalScrollbar'
import Playhead from './Playhead'
import TopStrip from './TopStrip'
import FocusRangeCurtains from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/FocusRangeCurtains'
import Markers from './Markers'

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: ${() => zIndexes.rightOverlay};
  overflow: visible;
  pointer-events: none;
`

const RightOverlay: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const containerStyle = usePrism(
    (): React.CSSProperties => ({
      width: val(layoutP.rightDims.width) + 'px',
    }),
    [layoutP],
  )

  return (
    <Container style={containerStyle}>
      <Playhead layoutP={layoutP} />
      <HorizontalScrollbar layoutP={layoutP} />
      <FrameStamp layoutP={layoutP} />
      <TopStrip layoutP={layoutP} />
      <Markers layoutP={layoutP} />
      <LengthIndicator layoutP={layoutP} />
      <FocusRangeCurtains layoutP={layoutP} />
    </Container>
  )
}

export default RightOverlay
