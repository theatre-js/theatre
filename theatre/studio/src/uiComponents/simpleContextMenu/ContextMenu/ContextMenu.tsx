import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import transparentize from 'polished/lib/color/transparentize'
import type {ElementType} from 'react'
import {useMemo} from 'react'
import {useContext} from 'react'
import React, {useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import useWindowSize from 'react-use/esm/useWindowSize'
import styled from 'styled-components'
import Item, {height as itemHeight} from './Item'
import {PortalContext} from 'reakit'
import useOnKeyDown from '@theatre/studio/uiComponents/useOnKeyDown'

const minWidth = 190

/**
 * How far from the menu should the pointer travel to auto close the menu
 */
const pointerDistanceThreshold = 20

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

export type IContextMenuItemCustomNodeRenderFn = (controls: {
  closeMenu(): void
}) => React.ReactChild

export type IContextMenuItem = {
  label: string | ElementType
  callback?: (e: React.MouseEvent) => void
  enabled?: boolean
  // subs?: Item[]
}

export type IContextMenuItemsValue =
  | IContextMenuItem[]
  | (() => IContextMenuItem[])

/**
 * TODO let's make sure that triggering a context menu would close
 * the other open context menu (if one _is_ open).
 */
const ContextMenu: React.FC<{
  items: IContextMenuItemsValue
  displayName?: string
  clickPoint: {clientX: number; clientY: number}
  onRequestClose: () => void
}> = (props) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const rect = useBoundingClientRect(container)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    if (!rect || !container) return

    const preferredAnchorPoint = {
      left: rect.width / 2,
      top: itemHeight / 2,
    }

    const pos = {
      left: props.clickPoint.clientX - preferredAnchorPoint.left,
      top: props.clickPoint.clientY - preferredAnchorPoint.top,
    }

    if (pos.left < 0) {
      pos.left = 0
    } else if (pos.left + rect.width > windowSize.width) {
      pos.left = windowSize.width - rect.width
    }

    if (pos.top < 0) {
      pos.top = 0
    } else if (pos.top + rect.height > windowSize.height) {
      pos.top = windowSize.height - rect.height
    }

    container.style.left = pos.left + 'px'
    container.style.top = pos.top + 'px'

    const onMouseMove = (e: MouseEvent) => {
      if (
        e.clientX < pos.left - pointerDistanceThreshold ||
        e.clientX > pos.left + rect.width + pointerDistanceThreshold ||
        e.clientY < pos.top - pointerDistanceThreshold ||
        e.clientY > pos.top + rect.height + pointerDistanceThreshold
      ) {
        props.onRequestClose()
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [rect, container, props.clickPoint, windowSize, props.onRequestClose])
  const portalLayer = useContext(PortalContext)

  useOnKeyDown((ev) => {
    if (ev.key === 'Escape') props.onRequestClose()
  })

  const items = useMemo(() => {
    const itemsArr = Array.isArray(props.items) ? props.items : props.items()
    if (itemsArr.length > 0) return itemsArr
    else
      return [
        {
          /**
           * TODO Need design for this
           */
          label: props.displayName
            ? `No actions for ${props.displayName}`
            : `No actions found`,
          enabled: false,
        },
      ]
  }, [props.items])

  return createPortal(
    <MenuContainer ref={setContainer}>
      {SHOW_OPTIONAL_MENU_TITLE && props.displayName ? (
        <MenuTitle>{props.displayName}</MenuTitle>
      ) : null}
      {items.map((item, i) => (
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
    </MenuContainer>,
    portalLayer!,
  )
}

export default ContextMenu
