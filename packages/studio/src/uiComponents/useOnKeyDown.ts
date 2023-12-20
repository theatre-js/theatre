import {useEffect, useRef} from 'react'

export default function useOnKeyDown(callback: (ev: KeyboardEvent) => void) {
  const ref = useRef(callback)
  ref.current = callback
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => ref.current(ev)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}
