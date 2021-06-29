import {theme} from '@theatre/studio/css'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {useVal} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {darken} from 'polished'
import React from 'react'
import styled from 'styled-components'
import FrameGrid from '@theatre/studio/panels/SequenceEditorPanel/FrameGrid/FrameGrid'

const Container = styled.div<{width: number}>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${(props) => props.width};
  bottom: 0;
  z-index: ${() => zIndexes.rightBackground};
  overflow: hidden;
  background: ${darken(1 * 0.03, theme.panel.bg)};
  pointer-events: none;
`

const DopeSheetBackground: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const width = useVal(layoutP.rightDims.width)
  const height = useVal(layoutP.panelDims.height)

  return (
    <Container width={width}>
      <FrameGrid width={width} height={height} layoutP={layoutP} />
    </Container>
  )
}

export default DopeSheetBackground
