import type {VoidFn} from '@theatre/core/types/public'
import React, {useContext, useEffect, useState} from 'react'
import ContextMenu from './ContextMenu/ContextMenu'
import type {ContextMenuProps} from './ContextMenu/ContextMenu'
import {contextMenuShownContext} from '@theatre/studio/panels/DetailPanel/DetailPanel'
import {closeAllTooltips} from '@theatre/studio/uiComponents/Popover/useTooltip'

const emptyNode = <></>

type IState =
  | {isOpen: true; event: undefined | Pick<MouseEvent, 'clientX' | 'clientY'>}
  | {isOpen: false}

export default function useMenu(
  _opts: {
    disabled?: boolean
    displayName?: string
    onOpen?: () => void
  } & Omit<ContextMenuProps, 'onRequestClose' | 'clickPoint'>,
): [
  node: React.ReactNode,
  open: (ev: undefined | Pick<MouseEvent, 'clientX' | 'clientY'>) => void,
  close: VoidFn,
  isOpen: boolean,
] {
  const {onOpen, ...contextMenuProps} = _opts

  const [state, setState] = useState<IState>({isOpen: false})

  const close = () => setState({isOpen: false})

  // TODO: this lock is now exported from the detail panel, do refactor it when you get the chance
  const [, addContextMenu] = useContext(contextMenuShownContext)

  useEffect(() => {
    let removeContextMenu: () => void | undefined
    if (state.isOpen) {
      closeAllTooltips()
      onOpen?.()
      removeContextMenu = addContextMenu()
    }

    return () => removeContextMenu?.()
  }, [state.isOpen, onOpen])

  const node = !state.isOpen ? (
    emptyNode
  ) : (
    <ContextMenu
      {...contextMenuProps}
      clickPoint={state.event}
      onRequestClose={close}
    />
  )

  const open = (ev: undefined | Pick<MouseEvent, 'clientX' | 'clientY'>) => {
    setState({isOpen: true, event: ev})
  }

  return [node, open, close, state.isOpen]
}
