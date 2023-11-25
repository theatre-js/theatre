import type {$IntentionalAny} from '@theatre/utils/types'
import {useEffect} from 'react'

export default function useOnClickOutside(
  container:
    | Element
    | null
    | React.MutableRefObject<Element | null>
    | (Element | null | React.MutableRefObject<Element | null>)[],
  onOutside: (e: MouseEvent) => void,
  enabled?: boolean,
  // Can be used e.g. to prevent unexpected closing-reopening when clicking on a
  // popover's trigger.
) {
  useEffect(() => {
    let containers: Array<Element> = (
      Array.isArray(container) ? container : [container]
    )
      .map((el) => (!el ? null : el instanceof Element ? el : el.current))
      .filter((el) => !!el) as Element[]

    if (containers.length === 0) return

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
