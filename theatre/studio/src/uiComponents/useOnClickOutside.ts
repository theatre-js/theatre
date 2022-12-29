import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {useEffect} from 'react'

export default function useOnClickOutside(
  container: Element | null | (Element | null)[],
  onOutside: (e: MouseEvent) => void,
  enabled?: boolean,
  // Can be used e.g. to prevent unexpected closing-reopening when clicking on a
  // popover's trigger.
) {
  useEffect(() => {
    if (!container || enabled === false) return

    const containers = Array.isArray(container)
      ? (container.filter((container) => container) as Element[])
      : [container]

    const onMouseDown = (e: MouseEvent) => {
      if (
        containers.every((container) => !e.composedPath().includes(container))
      ) {
        onOutside(e)
      }
    }

    window.addEventListener('mousedown', onMouseDown, {
      capture: true,
      passive: false,
    })
    return () => {
      window.removeEventListener('mousedown', onMouseDown, {
        capture: true,
        passive: false,
      } as unknown as $IntentionalAny)
    }
  }, [container, enabled])
}
