import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import ContextMenu from './ContextMenu/ContextMenu'
import type {
  IContextMenuItemsValue,
  IContextMenuItem,
} from './ContextMenu/ContextMenu'
import useRequestContextMenu from './useRequestContextMenu'
import type {IRequestContextMenuOptions} from './useRequestContextMenu'

// re-exports
export type {
  IContextMenuItemsValue,
  IContextMenuItem,
  IRequestContextMenuOptions,
}

const emptyNode = <></>

export default function useContextMenu(
  target: HTMLElement | SVGElement | null,
  opts: IRequestContextMenuOptions & {
    menuItems: IContextMenuItemsValue
  },
): [node: React.ReactNode, close: VoidFn, isOpen: boolean] {
  const [status, close] = useRequestContextMenu(target, opts)

  const node = !status.isOpen ? (
    emptyNode
  ) : (
    <ContextMenu
      items={opts.menuItems}
      clickPoint={status.event}
      onRequestClose={close}
    />
  )

  return [node, close, status.isOpen]
}
