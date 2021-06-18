import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import {useVal} from '@theatre/shared/utils/reactDataverse'
import getStudio from '@theatre/studio/getStudio'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'

const Container = styled.button<{isOpen: boolean}>`
  height: 100%;
  border: none;
  outline: none;
  background: ${(props) => (props.isOpen ? '#1A1C1E' : '#212327')};
  display: flex;

  padding: 0 8px;
  display: flex;
  color: #656d77;
  line-height: 22px;

  &:hover {
    color: white;
  }
`

const GraphEditorToggle: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  const isOpen = useVal(layoutP.graphEditorDims.isOpen)
  const toggle = useCallback(() => {
    const sheet = val(layoutP.sheet)
    const isOpen = val(layoutP.graphEditorDims.isOpen)
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.sequenceEditor.graphEditor.setIsOpen({
        isOpen: !isOpen,
      })
    })
  }, [layoutP])
  return (
    <Container isOpen={isOpen} onClick={toggle}>
      Graph Editor
    </Container>
  )
}

export default GraphEditorToggle
