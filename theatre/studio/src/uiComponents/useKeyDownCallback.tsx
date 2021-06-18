import {useEffect, useRef} from 'react'

type AcceptableCombo = 'Shift' | 'Meta' | 'Control' | 'Alt'

export default function useKeyDownCallback(
  combo: AcceptableCombo,
  listener: (opts: {down: boolean; event: KeyboardEvent}) => void,
) {
  const refs = useRef({combo, listener})
  refs.current = {combo, listener}
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === refs.current.combo) {
        refs.current.listener({down: true, event})
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === refs.current.combo) {
        refs.current.listener({down: false, event})
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
