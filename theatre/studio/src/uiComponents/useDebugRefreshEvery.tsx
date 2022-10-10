import {useEffect, useState} from 'react'

/**
 * Little utility hook that refreshes a react element every `ms` milliseconds. Use
 * it to debug whether the props of the element, or the return values of its hooks
 * are getting properly updated.
 *
 * @param ms - interval in milliseconds
 */
export default function useDebugRefreshEvery(ms: number = 500) {
  const [_, setState] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setState((i) => i + 1)
    }, ms)

    return () => {
      clearInterval(interval)
    }
  }, [])
}
