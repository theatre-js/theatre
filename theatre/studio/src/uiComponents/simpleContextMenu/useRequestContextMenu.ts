import type {$FixMe} from '@theatre/shared/utils/types'
import {useCallback, useEffect, useState} from 'react'

type IState = {isOpen: true; event: MouseEvent} | {isOpen: false}

type CloseMenuFn = () => void

const useRequestContextMenu = (
  target: HTMLElement | SVGElement | null,
): [state: IState, close: CloseMenuFn] => {
  const [state, setState] = useState<IState>({isOpen: false})
  const close = useCallback<CloseMenuFn>(() => setState({isOpen: false}), [])

  useEffect(() => {
    if (!target) {
      setState({isOpen: false})
      return
    }

    const onContextMenu = (event: MouseEvent) => {
      setState({isOpen: true, event})
      event.preventDefault()
      event.stopPropagation()
    }
    target.addEventListener('contextmenu', onContextMenu as $FixMe)
    return () => {
      target.removeEventListener('contextmenu', onContextMenu as $FixMe)
    }
  }, [target])

  return [state, close]
}

export default useRequestContextMenu
