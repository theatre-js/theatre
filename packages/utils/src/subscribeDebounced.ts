import type {Pointer, Prism} from '@theatre/dataverse'
import {isPointer, prism, val} from '@theatre/dataverse'
import type {$IntentionalAny} from './types'

/**
 * A utility function for subscribing to a prism and debouncing the callback. It makes sure that only one callback is running at a time.
 *
 * @param p - a prism or a pointer (which will be turned into a prism)
 * @param cb - a callback that will be called when the prism changes. This callback should return a promise. The promise will be awaited before the next call to the callback.
 * @returns a function that stops the subscription
 */
export function subscribeDebounced<T>(
  p: Prism<T> | Pointer<T>,
  cb: (val: T) => Promise<void>,
): () => void {
  const pr: Prism<T> = isPointer(p)
    ? prism(() => val(p))
    : (p as $IntentionalAny)

  let state: 'idle' | 'processing' | 'queued' = 'idle'
  let lastValue: T | {} = {} // the {} is unique, so it'll never be equal to anything else
  const onStale = async () => {
    if (state === 'queued') return
    if (state === 'processing') {
      state = 'queued'
      return
    }
    const newValue = pr.getValue()
    if (newValue === lastValue) return
    lastValue = newValue
    state = 'processing'

    try {
      await cb(newValue)
    } catch (error) {
      console.error(error)
    } finally {
      // @ts-ignore
      if (state === 'queued') {
        state = 'idle'
        void onStale()
      } else {
        state = 'idle'
      }
    }
  }
  const stop = pr.onStale(() => onStale())
  void onStale()

  return stop
}
