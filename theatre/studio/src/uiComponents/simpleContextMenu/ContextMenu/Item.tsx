import noop from '@theatre/shared/utils/noop'
import type {ElementType} from 'react'
import React from 'react'
import styled from 'styled-components'

export const height = 26

const ItemContainer = styled.li<{enabled: boolean}>`
  height: ${height}px;
  padding: 0 12px;
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 400;
  position: relative;
  pointer-events: ${(props) => (props.enabled ? 'auto' : 'none')};
  color: ${(props) => (props.enabled ? 'white' : '#AAA')};

  &:after {
    position: absolute;
    inset: 2px 1px;
    display: block;
    content: ' ';
    pointer-events: none;
    z-index: -1;
    border-radius: 3px;
  }

  &:hover:after {
    background-color: rgba(63, 174, 191, 0.75);
  }
`

const ItemLabel = styled.span``

const Item: React.FC<{
  label: string | ElementType
  onClick: (e: React.MouseEvent) => void
  enabled: boolean
}> = (props) => {
  return (
    <ItemContainer
      onClick={props.enabled ? props.onClick : noop}
      enabled={props.enabled}
    >
      <ItemLabel>{props.label}</ItemLabel>
    </ItemContainer>
  )
}

export default Item
