import {useLayoutEffect, useState} from 'react'

export default function useBoundingClientRect(
  node: Element | React.MutableRefObject<Element | null> | null | undefined,
): null | DOMRect {
  const [bounds, set] = useState<null | DOMRect>(null)

  useLayoutEffect(() => {
    if (node) {
      if (node instanceof Element) {
        set(node.getBoundingClientRect())
      } else if (node.current instanceof Element) {
        set(node.current.getBoundingClientRect())
      }
    }

    return () => {
      set(null)
    }
  }, [node])

  return bounds
}
