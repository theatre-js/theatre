import {useVal} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import StampsGrid from '@theatre/studio/panels/SequenceEditorPanel/FrameGrid/StampsGrid'
import PanelDragZone from '@theatre/studio/panels/BasePanel/PanelDragZone'
import {attributeNameThatLocksFramestamp} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import FocusRange, {focusRangeTheme} from './FocusRange'

export const topStripHeight = 20

export const topStripTheme = {
  backgroundColor: `#1f2120eb`,
  borderColor: `#1c1e21`,
}

const Container = styled(PanelDragZone)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${topStripHeight}px;
  box-sizing: border-box;
  background: ${topStripTheme.backgroundColor};
  border-bottom: 1px solid ${topStripTheme.borderColor};
  ${pointerEventsAutoInNormalMode};
`

const FocusRangeContainer = styled.div`
  position: absolute;
  /* t */
  op: ${topStripHeight}px;
  top: 0;
  left: 0;
  right: 0;
  height: ${topStripHeight / 2}px;
  background-color: ${focusRangeTheme.inactive.backgroundColor};
  box-sizing: border-box;
`

const TopStrip: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const width = useVal(layoutP.rightDims.width)

  return (
    <>
      <Container {...{[attributeNameThatLocksFramestamp]: 'hide'}}>
        <StampsGrid layoutP={layoutP} width={width} height={topStripHeight} />
      </Container>
      <FocusRangeContainer>
        <FocusRange layoutP={layoutP} />
      </FocusRangeContainer>
    </>
  )
}

export default TopStrip
