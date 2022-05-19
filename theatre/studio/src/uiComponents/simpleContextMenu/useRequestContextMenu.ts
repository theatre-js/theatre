import type {$FixMe} from '@theatre/shared/utils/types'
import {useCallback, useEffect, useState} from 'react'

type IState = {isOpen: true; event: MouseEvent} | {isOpen: false}

type CloseMenuFn = () => void

export type IRequestContextMenuOptions = {
  disabled?: boolean
}

const useRequestContextMenu = (
  target: HTMLElement | SVGElement | null,
  opts: IRequestContextMenuOptions,
): [state: IState, close: CloseMenuFn] => {
  const [state, setState] = useState<IState>({isOpen: false})
  const close = useCallback<CloseMenuFn>(() => setState({isOpen: false}), [])

  useEffect(() => {
    if (!target || opts.disabled === true) {
      setState({isOpen: false})
      return
    }

    const onTrigger = (event: MouseEvent) => {
      setState({isOpen: true, event})
      event.preventDefault()
      event.stopPropagation()
    }
    target.addEventListener('contextmenu', onTrigger as $FixMe)
    return () => {
      target.removeEventListener('contextmenu', onTrigger as $FixMe)
    }
  }, [target, opts.disabled])

  return [state, close]
}

export default useRequestContextMenu
