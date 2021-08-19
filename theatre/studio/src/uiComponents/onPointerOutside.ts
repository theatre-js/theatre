import {useEffect} from 'react'
import useBoundingClientRect from './useBoundingClientRect'

export default function onPointerOutside(
  container: Element | null,
  threshold: number,
  onPointerOutside: () => void,
) {
  const containerRect = useBoundingClientRect(container)

  useEffect(() => {
    if (!containerRect) return

    const onMouseMove = (e: MouseEvent) => {
      if (
        e.clientX < containerRect.left - threshold ||
        e.clientX > containerRect.left + containerRect.width + threshold ||
        e.clientY < containerRect.top - threshold ||
        e.clientY > containerRect.top + containerRect.height + threshold
      ) {
        onPointerOutside()
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [containerRect, threshold])
}
