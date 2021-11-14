import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {useEffect} from 'react'

export default function useOnClickOutside(
  container: Element | null,
  onOutside: (e: MouseEvent) => void,
  enabled?: boolean,
) {
  useEffect(() => {
    if (!container || enabled === false) return

    const onMouseDown = (e: MouseEvent) => {
      if (!e.composedPath().includes(container)) {
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
