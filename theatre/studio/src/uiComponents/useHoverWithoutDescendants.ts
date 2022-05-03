import {useEffect, useState} from 'react'

/**
 * A react hook that returns true if the pointer is hovering over the target element and not its descendants
 */
export default function useHoverWithoutDescendants(
  target: HTMLElement | null | undefined,
): boolean {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  useEffect(() => {
    setIsHovered(false)
    if (!target) return

    const onMouseEnterOrMove = (e: MouseEvent) => {
      if (e.target === target) {
        setIsHovered(true)
      } else {
        setIsHovered(false)
      }
    }
    const onMouseLeave = () => {
      setIsHovered(false)
    }

    target.addEventListener('mouseenter', onMouseEnterOrMove)
    target.addEventListener('mousemove', onMouseEnterOrMove)
    target.addEventListener('mouseleave', onMouseLeave)

    return () => {
      setIsHovered(false)
      target.removeEventListener('mouseenter', onMouseEnterOrMove)
      target.removeEventListener('mousemove', onMouseEnterOrMove)
      target.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [target])

  return isHovered
}
