import {useCallback, useEffect, useState} from 'react'

const EMPTY_ARRAY: any[] = []

export function useUnmount(fn: () => void) {
  useEffect(() => fn, EMPTY_ARRAY)
}

export function useForceUpdate() {
  const [, setTick] = useState(0)

  const update = useCallback(() => {
    setTick(tick => tick + 1)
  }, [])

  return update
}
