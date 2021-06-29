import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {usePrism} from '@theatre/dataverse-react'
import {theme} from '@theatre/studio/css'
import React from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import GraphEditorToggle from './GraphEditorToggle'

const Container = styled.div<{graphEditorOpen: boolean}>`
  position: absolute;
  z-index: ${() => zIndexes.bottomRectangleThingy};
  background: ${theme.panel.bg};
  box-sizing: border-box;
  border-top: 1px solid rgba(0, 0, 0, 0.45);
  border-bottom: ${({graphEditorOpen}) =>
    graphEditorOpen ? '1px solid rgba(0, 0, 0, 0.45)' : 'none'};
`

const Left = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
`
const Right = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
`

const BottomRectangleThingy: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const {dims, leftWidth, rightWidth, graphEditorOpen} = usePrism(() => {
    return {
      dims: val(layoutP.bottomRectangleThingyDims),
      leftWidth: val(layoutP.leftDims.width),
      rightWidth: val(layoutP.rightDims.width),
      graphEditorOpen: val(layoutP.graphEditorDims.isOpen),
    }
  }, [layoutP])
  return (
    <Container
      graphEditorOpen={graphEditorOpen}
      style={{
        width: dims.width + 'px',
        height: dims.height + 'px',
        bottom: dims.bottom + 'px',
      }}
    >
      <Left
        style={{
          width: leftWidth + 'px',
          left: 0 + 'px',
        }}
      ></Left>
      <Right
        style={{
          left: leftWidth + 'px',
          width: rightWidth + 'px',
        }}
      >
        <GraphEditorToggle layoutP={layoutP} />
      </Right>
    </Container>
  )
}

export default BottomRectangleThingy
