import {prism} from '@theatre/dataverse'
import type {$IntentionalAny} from '@theatre/utils/types'

/**
 * A prism hook that runs fn() into a prism() call and returns the result
 */
export default function subPrism<T, Deps extends undefined | $IntentionalAny[]>(
  key: string,
  fn: () => T,
  deps: Deps,
): T {
  const m = prism.memo(key, () => prism(fn), deps)

  return m.getValue()
}
