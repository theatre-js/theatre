import type {ElementType} from 'react'
import React from 'react'
import styled from 'styled-components'

export const height = 30

const Container = styled.li`
  height: ${height}px;
  padding: 0 12px;
  margin: 0;
  display: flex;
  align-items: center;
  font-weight: 600;

  &:hover {
    background: #2bb5de;
  }
`

const Label = styled.span``

const Item: React.FC<{
  label: string | ElementType
  onClick: (e: React.MouseEvent) => void
}> = (props) => {
  return (
    <Container onClick={props.onClick}>
      <Label>{props.label}</Label>
    </Container>
  )
}

export default Item
