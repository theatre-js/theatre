import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import RightClickMenu from './RightClickMenu/RightClickMenu'
import useRequestContextMenu from './useRequestContextMenu'
export type {IContextMenuItem} from './RightClickMenu/RightClickMenu'

const emptyNode = <></>

type IProps = Omit<
  Parameters<typeof RightClickMenu>[0],
  'rightClickPoint' | 'onRequestClose'
>

export default function useContextMenu(
  target: HTMLElement | SVGElement | null,
  props: IProps,
): [node: React.ReactNode, close: VoidFn, isOpen: boolean] {
  const [status, close] = useRequestContextMenu(target)

  const node = !status.isOpen ? (
    emptyNode
  ) : (
    <RightClickMenu
      items={props.items}
      rightClickPoint={status.event}
      onRequestClose={close}
    />
  )

  return [node, close, status.isOpen]
}
