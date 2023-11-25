import useBoundingClientRect from '@theatre/studio/uiComponents/useBoundingClientRect'
import {useMemo} from 'react'
import {useContext} from 'react'
import React, {useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import useWindowSize from 'react-use/esm/useWindowSize'
import {height as itemHeight} from './Item'
import {PortalContext} from 'reakit'
import useOnKeyDown from '@theatre/studio/uiComponents/useOnKeyDown'
import BaseMenu from './BaseMenu'
import type {ContextMenuItem} from '@theatre/studio/uiComponents/chordial/chordialInternals'

/**
 * How far from the menu should the pointer travel to auto close the menu
 */
const pointerDistanceThreshold = 20

export type IContextMenuItemCustomNodeRenderFn = (controls: {
  closeMenu(): void
}) => React.ReactElement

export type IContextMenuItemsValue =
  | ContextMenuItem[]
  | (() => ContextMenuItem[])

export type ContextMenuProps = {
  items: IContextMenuItemsValue
  displayName?: React.ReactNode
  clickPoint?: {
    clientX: number
    clientY: number
  }
  onRequestClose: () => void
  // default: true
  closeOnPointerLeave?: boolean
}

/**
 * TODO let's make sure that triggering a context menu would close
 * the other open context menu (if one _is_ open).
 */
const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const rect = useBoundingClientRect(container)
  const windowSize = useWindowSize()

  useLayoutEffect(() => {
    if (!rect || !container) return

    const windowGap = 10
    const windowEdges = {
      left: windowGap,
      top: windowGap,
      right: windowSize.width - windowGap,
      bottom: windowSize.height - windowGap,
    }

    const preferredAnchorPoint = {
      left: rect.width / 2,
      // if there is a displayName, make sure to move the context menu up by one item,
      // so that the first active item is the one the mouse is hovering over
      top: itemHeight / 2 + (props.displayName ? itemHeight : 0),
    }

    const clickPoint = props.clickPoint ?? {clientX: 0, clientY: 0}

    const pos = {
      left: clickPoint.clientX - preferredAnchorPoint.left,
      top: clickPoint.clientY - preferredAnchorPoint.top,
    }

    if (pos.left < windowEdges.left) {
      pos.left = windowEdges.left
    } else if (pos.left + rect.width > windowEdges.right) {
      pos.left = windowEdges.right - rect.width
    }

    if (pos.top < windowEdges.top) {
      pos.top = windowEdges.top
    } else if (pos.top + rect.height > windowEdges.bottom) {
      pos.top = windowEdges.bottom - rect.height
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
        if (props.closeOnPointerLeave !== false) props.onRequestClose()
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [
    rect,
    container,
    props.clickPoint,
    windowSize,
    props.onRequestClose,
    props.closeOnPointerLeave,
  ])
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
    <BaseMenu
      items={items}
      onRequestClose={props.onRequestClose}
      displayName={props.displayName}
      ref={setContainer}
    />,
    portalLayer!,
  )
}

export default ContextMenu
