import React from 'react'
import styled from 'styled-components'
import AppButton from './AppButton/AppButton'
import WorkspaceButton from './WorkspaceButton/WorkspaceButton'

const Container = styled.div`
  height: 28px;
  flex-shrink: 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  flex-direction: row;
  margin-left: 13px;

  border-radius: 3px;
  background: rgba(47, 50, 53, 0.88);
  box-shadow: 0px 4px 4px -1px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`

const Separator = styled.div`
  background: rgba(0, 0, 0, 0.24);
  width: 1px;
  height: 100%;
`

const LeftStrip: React.FC<{}> = (props) => {
  return (
    <Container>
      <AppButton />
      <Separator />
      <WorkspaceButton />
    </Container>
  )
}

export default LeftStrip
