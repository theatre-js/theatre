import type {$FixMe, VoidFn} from '@theatre/core/types/public'
import type React from 'react'
import {useEffect} from 'react'
import useMenu from './useMenu'

export default function useContextMenu(
  target: HTMLElement | SVGElement | null,
  opts: Parameters<typeof useMenu>[0],
): [node: React.ReactNode, close: VoidFn, isOpen: boolean] {
  const [node, open, close, isOpen] = useMenu(opts)

  useEffect(() => {
    if (!target || opts.disabled === true) {
      close()
      return
    }

    const onTrigger = (event: MouseEvent) => {
      open(event)
      event.preventDefault()
      event.stopPropagation()
    }
    target.addEventListener('contextmenu', onTrigger as $FixMe)
    return () => {
      target.removeEventListener('contextmenu', onTrigger as $FixMe)
    }
  }, [target, opts.disabled])

  return [node, close, isOpen]
}
