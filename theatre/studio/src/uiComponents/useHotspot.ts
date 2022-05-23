import {useEffect, useState} from 'react'

export default function useHotspot(spot: 'left' | 'right') {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const hoverListener = (e: MouseEvent) => {
      const threshold = active ? 200 : 50

      const mouseInside =
        spot === 'left' ? e.x < threshold : e.x > window.innerWidth - threshold

      if (mouseInside) {
        setActive(true)
      } else {
        setActive(false)
      }
    }
    document.addEventListener('mousemove', hoverListener)

    const leaveListener = () => {
      setActive(false)
    }

    document.addEventListener('mouseleave', leaveListener)

    return () => {
      document.removeEventListener('mousemove', hoverListener)
      document.removeEventListener('mouseleave', leaveListener)
    }
  }, [active])

  return active
}
