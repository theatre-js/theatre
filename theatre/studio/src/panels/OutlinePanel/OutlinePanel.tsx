import {usePrism} from '@theatre/dataverse-react'
import React from 'react'
import styled from 'styled-components'
import ProjectsList from './ProjectsList/ProjectsList'
import type {PanelPosition} from '@theatre/studio/store/types'
import BasePanel from '@theatre/studio/panels/BasePanel/BasePanel'
import PanelWrapper from '@theatre/studio/panels/BasePanel/PanelWrapper'
import PanelDragZone from '@theatre/studio/panels/BasePanel/PanelDragZone'

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenLeft', distance: 0.2},
    right: {from: 'screenLeft', distance: 0.4},
    top: {from: 'screenTop', distance: 0.2},
    bottom: {from: 'screenBottom', distance: 0.2},
  },
}

const minDims = {width: 300, height: 300}

const OutlinePanel: React.FC<{}> = (props) => {
  return (
    <BasePanel
      panelId="outlinePanel"
      defaultPosition={defaultPosition}
      minDims={minDims}
    >
      <Content />
    </BasePanel>
  )
}

const Container = styled(PanelWrapper)`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  box-shadow: none;
`

const Title = styled.div`
  width: 100%;
`

const Header = styled.div`
  display: none;
`

const F2 = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  padding: 0;
`

const Content: React.FC = () => {
  return usePrism(() => {
    return (
      <Container>
        <PanelDragZone>
          <Header>
            <Title>Outline</Title>
          </Header>
        </PanelDragZone>
        <F2>
          <ProjectsList />
        </F2>
      </Container>
    )
  }, [])
}

export default OutlinePanel
