import type {Prism} from '@theatre/dataverse'
import {defer} from '@theatre/utils/defer'

/**
 * Returns a promise that resolved when the given prism's value satisfies the given condition.
 * Example:
 * ```ts
 * const prism = prism(...)
 * const value = await waitForPrism(prism, (value) => value % 2 === 0)
 * ```
 */
export default async function waitForPrism<T>(
  pr: Prism<T>,
  condition: (value: T) => boolean,
): Promise<T> {
  const deferred = defer<T>()
  const resolve = (value: T) => {
    unsub()
    deferred.resolve(value)
  }
  const check = () => {
    const value = pr.getValue()
    const r = condition(value)
    if (r === true) {
      resolve(value)
    } else if (typeof r !== 'boolean') {
      console.error(`waitForPrism condition must return a boolean, got ${r}`)
    }
  }
  const unsub = pr.onStale(check)
  check()

  return deferred.promise
}
