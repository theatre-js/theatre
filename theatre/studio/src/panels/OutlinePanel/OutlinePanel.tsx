import React from 'react'
import styled from 'styled-components'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import ProjectsList from './ProjectsList/ProjectsList'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const Container = styled.div`
  background-color: transparent;
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 12px;
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
    ${pointerEventsAutoInNormalMode};
  }

  &:hover:before {
    top: -12px;
    width: 300px;
  }
`

const TriggerContainer = styled.div`
  top: 0;
`

const Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateX(-100%);
  pointer-events: none;

  ${Container}:hover & {
    transform: translateX(0);
  }
`

const headerHeight = `32px`

const Header = styled.div`
  height: ${headerHeight};
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  ${pointerEventsAutoInNormalMode};

  &:after {
    position: absolute;
    inset: 4px 0px;
    display: block;
    content: ' ';
    pointer-events: none;
    z-index: -1;
    background-color: #69777947;
    border-radius: 0 2px 2px 0;
  }
`

const Title = styled.div`
  margin: 0 10px;
  color: #ffffffc2;
  font-weight: 500;
  font-size: 10px;
  user-select: none;
  ${pointerEventsAutoInNormalMode};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Body = styled.div`
  ${pointerEventsAutoInNormalMode};
  position: absolute;
  top: ${headerHeight};
  left: 0;
  height: auto;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  overflow-x: visible;
  padding: 0;
  user-select: none;
`

const OutlinePanel: React.FC<{}> = (props) => {
  return (
    <Container>
      <TriggerContainer>
        {/* <ToolbarIconButton icon={} label="Outline" /> */}
      </TriggerContainer>
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
