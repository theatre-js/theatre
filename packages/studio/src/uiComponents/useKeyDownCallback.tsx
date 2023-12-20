import {useEffect, useRef} from 'react'

type AcceptableCombo = 'Shift' | 'Meta' | 'Control' | 'Alt'

export default function useKeyDownCallback(
  combo: AcceptableCombo,
  listener: (opts: {down: boolean; event: KeyboardEvent | undefined}) => void,
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

    function onBlur(event: unknown) {
      refs.current.listener({down: false, event: undefined})
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}
