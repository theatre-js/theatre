import React from 'react'
import styled from 'styled-components'
import AuthState from './AuthState/AuthState'

const Container = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: nowrap;
`

const RightStrip: React.FC<{}> = (props) => {
  return (
    <Container>
      <AuthState />
    </Container>
  )
}

export default RightStrip
