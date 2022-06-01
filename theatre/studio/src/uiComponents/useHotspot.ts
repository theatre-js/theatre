import {useEffect, useState} from 'react'

export default function useHotspot(spot: 'left' | 'right') {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const hoverListener = (e: MouseEvent) => {
      const threshold = active ? 200 : 50

      // This is a super specific solution just for now so that the hotspot region
      // excludes the pin button.
      const topBuffer = 56

      let mouseInside =
        spot === 'left' ? e.x < threshold : e.x > window.innerWidth - threshold

      mouseInside &&= e.y > topBuffer

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
