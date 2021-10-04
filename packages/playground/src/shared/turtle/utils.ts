import {useLayoutEffect, useState} from 'react'

export function useBoundingClientRect(
  node: HTMLElement | null,
): null | DOMRect {
  const [bounds, set] = useState<null | DOMRect>(null)

  useLayoutEffect(() => {
    if (node) {
      set(node.getBoundingClientRect())
    }

    return () => {
      set(null)
    }
  }, [node])

  return bounds
}
