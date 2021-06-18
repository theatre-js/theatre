import logger from '@theatre/shared/logger'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {useCallback, useEffect, useState} from 'react'

const EMPTY_ARRAY: $IntentionalAny[] = []

export function useUnmount(fn: () => void) {
  useEffect(() => fn, EMPTY_ARRAY)
}

export function useForceUpdate(debugLabel?: string) {
  const [, setTick] = useState(0)

  const update = useCallback(() => {
    if (process.env.NODE_ENV !== 'production' && debugLabel)
      logger.log(debugLabel, 'forceUpdate', {trace: new Error()})

    setTick((tick) => tick + 1)
  }, [])

  return update
}
