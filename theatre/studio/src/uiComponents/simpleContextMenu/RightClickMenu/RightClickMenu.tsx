import getStudio from '@theatre/studio/getStudio'
import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import transparentize from 'polished/lib/color/transparentize'
import type {ElementType} from 'react'
import React, {useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import useWindowSize from 'react-use/esm/useWindowSize'
import styled from 'styled-components'
import Item, {height as itemHeight} from './Item'

const minWidth = 190

/**
 * How far from the menu should the pointer travel to auto close the menu
 */
const pointerDistanceThreshold = 20

const Container = styled.ul`
  position: absolute;
  min-width: ${minWidth}px;
  z-index: 10000;
  background: ${transparentize(0.2, '#111')};
  color: white;
  list-style-type: none;
  padding: 2px 0;
  margin: 0;
  border-radius: 1px;
  cursor: default;
  pointer-events: all;
  border-radius: 3px;
`

export type IContextMenuItem = {
  label: string | ElementType
  callback?: (e: React.MouseEvent) => void
  // subs?: Item[]
}

const RightClickMenu: React.FC<{
  items: IContextMenuItem[] | (() => IContextMenuItem[])
  rightClickPoint: {clientX: number; clientY: number}
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
      left: props.rightClickPoint.clientX - preferredAnchorPoint.left,
      top: props.rightClickPoint.clientY - preferredAnchorPoint.top,
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
  }, [rect, container, props.rightClickPoint, windowSize, props.onRequestClose])

  const items = Array.isArray(props.items) ? props.items : props.items()

  return createPortal(
    <Container ref={setContainer}>
      {items.map((item, i) => (
        <Item
          key={`item-${i}`}
          label={item.label}
          onClick={(e) => {
            if (item.callback) {
              item.callback(e)
            }
            props.onRequestClose()
          }}
        />
      ))}
    </Container>,
    getStudio()!.ui.containerShadow,
  )
}

export default RightClickMenu
