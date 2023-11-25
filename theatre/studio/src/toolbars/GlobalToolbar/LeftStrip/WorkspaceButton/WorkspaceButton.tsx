import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import DropdownChevron from '@theatre/studio/uiComponents/icons/DropdownChevron'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  text-wrap: nowrap;
  padding: 0 12px;
  height: 100%;
  font-weight: 500;
  ${pointerEventsAutoInNormalMode};
  cursor: default;
  &:hover {
    --chevron-down: 1;
    background: rgba(255, 255, 255, 0.08);
  }
`

const Team = styled.span`
  color: rgba(255, 255, 255, 0.38);
`
const Separator = styled.span`
  color: rgba(255, 255, 255, 0.38);
`
const WorkspaceName = styled.span``

const WorkspaceButton: React.FC<{}> = (props) => {
  const team = `Team Freight`
  const wsName = `Solar Play`
  return (
    <Container>
      <Team>{team}</Team>
      <Separator>{`/`}</Separator>
      <WorkspaceName>{wsName}</WorkspaceName>
      <DropdownChevron />
    </Container>
  )
}

export default WorkspaceButton
