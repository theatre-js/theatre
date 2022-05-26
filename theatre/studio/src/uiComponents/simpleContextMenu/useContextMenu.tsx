import type {VoidFn} from '@theatre/shared/utils/types'
import React, {useEffect} from 'react'
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
    displayName?: string
    onOpen?: () => void
  },
): [node: React.ReactNode, close: VoidFn, isOpen: boolean] {
  const [status, close] = useRequestContextMenu(target, opts)

  useEffect(() => {
    if (status.isOpen) {
      opts.onOpen?.()
    }
  }, [status.isOpen, opts.onOpen])

  const node = !status.isOpen ? (
    emptyNode
  ) : (
    <ContextMenu
      items={opts.menuItems}
      displayName={opts.displayName}
      clickPoint={status.event}
      onRequestClose={close}
    />
  )

  return [node, close, status.isOpen]
}
