import type {MutableRefObject} from 'react'
import {useMemo, useState} from 'react'

const notComputed = Symbol()

/**
 * Combines useRef() and useState().
 *
 * @example
 * Usage:
 * ```ts
 * const [ref, val] = useRefAndState<HTMLDivElement | null>(null)
 *
 * useEffect(() => {
 *   val.addEventListener(...)
 * }, [val])
 *
 * return <div ref={ref}></div>
 * ```
 */
export default function useRefAndState<T>(
  initialValue: (() => T) | T,
): [ref: MutableRefObject<T>, state: T] {
  const ref = useMemo(() => {
    let current =
      typeof initialValue === 'function' ? notComputed : initialValue
    return {
      get current() {
        if (current === notComputed) current = (initialValue as () => T)()
        return current
      },
      set current(v: T) {
        current = v
        setState(v)
      },
    }
  }, [])

  const [state, setState] = useState<T>(() => ref.current)

  return [ref, state]
}
