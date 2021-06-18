import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import LengthIndicator from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/LengthIndicator'
import FrameStamp from './FrameStamp'
import HorizontalScrollbar from './HorizontalScrollbar'
import Playhead from './Playhead'
import TopStrip from './TopStrip'

const Container = styled.div<{width: number}>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${(props) => props.width}px;
  bottom: 0;
  z-index: ${() => zIndexes.rightOverlay};
  overflow: visible;
  pointer-events: none;
`

const RightOverlay: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const width = val(layoutP.rightDims.width)

    return (
      <Container width={width}>
        <Playhead layoutP={layoutP} />
        <HorizontalScrollbar layoutP={layoutP} />
        <FrameStamp layoutP={layoutP} />
        <TopStrip layoutP={layoutP} />
        <LengthIndicator layoutP={layoutP} />
      </Container>
    )
  }, [layoutP])
}

export default RightOverlay
