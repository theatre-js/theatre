import React from 'react'
import styled from 'styled-components'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import ProjectsList from './ProjectsList/ProjectsList'

const Container = styled.div`
  background-color: transparent;
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 50px;
  bottom: 0px;
  right: 0;
  z-index: ${panelZIndexes.outlinePanel};

  &:before {
    display: block;
    content: ' ';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 20px;
    pointer-events: auto;
  }
`

const Content = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  pointer-events: auto;
  user-select: none;
  /* background-color: blue; */

  ${Container}:hover & {
    transform: translateX(0);
  }
`

const Title = styled.div`
  width: 100%;
`

const Header = styled.div`
  display: none;
`

const Body = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
  padding: 0;
`

const OutlinePanel: React.FC<{}> = (props) => {
  return (
    <Container>
      <Content>
        <Header>
          <Title>Outline</Title>
        </Header>
        <Body>
          <ProjectsList />
        </Body>
      </Content>
    </Container>
  )
}

export default OutlinePanel
