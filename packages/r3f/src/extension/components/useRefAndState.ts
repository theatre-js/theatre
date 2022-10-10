import type {MutableRefObject} from 'react'
import {useMemo, useState} from 'react'

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
  initialValue: T,
): [ref: MutableRefObject<T>, state: T] {
  const ref = useMemo(() => {
    let current = initialValue
    return {
      get current() {
        return current
      },
      set current(v: T) {
        current = v
        setState(v)
      },
    }
  }, [])

  const [state, setState] = useState<T>(() => initialValue)

  return [ref, state]
}
