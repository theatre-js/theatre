import type {ElementType} from 'react'
import React from 'react'
import Item from './Item'
import type {$FixMe} from '@theatre/utils/types'
import styled from 'styled-components'
import {transparentize} from 'polished'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const minWidth = 190

const SHOW_OPTIONAL_MENU_TITLE = true

const MenuContainer = styled.ul`
  position: absolute;
  min-width: ${minWidth}px;
  z-index: 10000;
  background: ${transparentize(0.2, '#111')};
  backdrop-filter: blur(2px);
  color: white;
  list-style-type: none;
  padding: 2px 0;
  margin: 0;
  border-radius: 1px;
  cursor: default;
  ${pointerEventsAutoInNormalMode};
  border-radius: 3px;
`

const MenuTitle = styled.div`
  padding: 4px 10px;
  border-bottom: 1px solid #6262626d;
  color: #adadadb3;
  font-size: 11px;
  font-weight: 500;
`

type MenuItem = {
  label: string | ElementType
  callback?: (e: React.MouseEvent) => void
  enabled?: boolean
  // subs?: Item[]
}

const BaseMenu: React.FC<{
  items: MenuItem[]
  ref?: $FixMe
  displayName?: string
  onRequestClose: () => void
}> = React.forwardRef((props, ref: $FixMe) => {
  return (
    <MenuContainer ref={ref}>
      {SHOW_OPTIONAL_MENU_TITLE && props.displayName ? (
        <MenuTitle>{props.displayName}</MenuTitle>
      ) : null}
      {props.items.map((item, i) => (
        <Item
          key={`item-${i}`}
          label={item.label}
          enabled={item.enabled === false ? false : true}
          onClick={(e) => {
            if (item.callback) {
              item.callback(e)
            }
            props.onRequestClose()
          }}
        />
      ))}
    </MenuContainer>
  )
})

export default BaseMenu
