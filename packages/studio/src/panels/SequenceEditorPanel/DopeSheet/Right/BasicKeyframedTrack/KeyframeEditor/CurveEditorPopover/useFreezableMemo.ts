import {useMemo, useRef, useState} from 'react'

/**
 * The same as useMemo except that it can be frozen so that
 * the memoized function is not recomputed even if the dependencies
 * change. It can also be unfrozen.
 *
 * An unfrozen useFreezableMemo is the same as useMemo.
 *
 */
export function useFreezableMemo<T>(
  fn: (setFreeze: (isFrozen: boolean) => void) => T,
  deps: any[],
): T {
  const [isFrozen, setFreeze] = useState<boolean>(false)
  const freezableDeps = useRef(deps)

  if (!isFrozen) freezableDeps.current = deps

  return useMemo(() => fn(setFreeze), freezableDeps.current)
}
