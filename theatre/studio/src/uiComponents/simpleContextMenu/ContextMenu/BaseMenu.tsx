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
  background: ${transparentize(0.8, '#000000')};
  backdrop-filter: blur(8px) saturate(300%) contrast(65%) brightness(70%);
  color: white;
  border: 0.5px solid #6262622c;
  box-sizing: border-box;
  box-shadow: ${transparentize(0.75, '#000000')} 0px 4px 20px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  cursor: default;
  ${pointerEventsAutoInNormalMode};
  border-radius: 4px;
`

const MenuTitle = styled.div`
  padding: 8px 10px 6px;
  position: relative;

  color: #d1d1d1;
  font-size: 10px;
  font-weight: 500;

  /* &:after {
    // a horizontal line, taking up no space, with 4px padding on each side
    content: '';
    display: block;
    height: 1px;
    background: #6262622c;
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 0px;
  } */
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
