import {useEffect, useState} from 'react'

export default function useHover(
  target: HTMLElement | null | undefined,
): boolean {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  useEffect(() => {
    setIsHovered(false)
    if (!target) return
    const onMouseEnter = () => {
      setIsHovered(true)
    }
    const onMouseLeave = () => {
      setIsHovered(false)
    }

    target.addEventListener('mouseenter', onMouseEnter)
    target.addEventListener('mouseleave', onMouseLeave)

    return () => {
      setIsHovered(false)
      target.removeEventListener('mouseenter', onMouseEnter)
      target.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [target])

  return isHovered
}
