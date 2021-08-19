import {useEffect} from 'react'

export default function useOnClickOutside(
  container: Element | null,
  onOutside: (e: MouseEvent) => void,
) {
  useEffect(() => {
    if (!container) return

    const onMouseDown = (e: MouseEvent) => {
      if (!e.composedPath().includes(container)) {
        onOutside(e)
      }
    }

    window.addEventListener('mousedown', onMouseDown, {capture: true})
    return () => {
      window.removeEventListener('mousedown', onMouseDown, {capture: true})
    }
  }, [container, onOutside])
}
