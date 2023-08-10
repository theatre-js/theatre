import {pointerToPrism} from '../pointerToPrism'
import type {Pointer} from '../pointer'
import {isPointer} from '../pointer'
import type {Prism} from './Interface'
import {isPrism} from './Interface'

export default async function* asyncIterateOver<V>(
  pointerOrPrism: Prism<V> | Pointer<V>,
): AsyncGenerator<V, void, void> {
  let d: Prism<V>
  if (isPointer(pointerOrPrism)) {
    d = pointerToPrism(pointerOrPrism) as Prism<V>
  } else if (isPrism(pointerOrPrism)) {
    d = pointerOrPrism
  } else {
    throw new Error(`Only pointers and prisms are supported`)
  }

  const unsub = d.keepHot()

  let lastValue = d.getValue()

  yield lastValue

  try {
    while (true) {
      const newValue = d.getValue()
      if (newValue !== lastValue) {
        lastValue = newValue
        yield lastValue
      } else {
        const deferred = defer<V>()

        const stop = d.onStale(() => {
          const newValue = d.getValue()
          if (newValue !== lastValue) {
            lastValue = newValue
            stop()
            deferred.resolve(lastValue)
          }
        })

        yield deferred.promise
      }
    }
  } finally {
    unsub()
  }
}

interface Deferred<PromiseType> {
  resolve: (d: PromiseType) => void
  reject: (d: unknown) => void
  promise: Promise<PromiseType>
  status: 'pending' | 'resolved' | 'rejected'
}

/**
 * A simple imperative API for resolving/rejecting a promise.
 *
 * Example:
 * ```ts
 * function doSomethingAsync() {
 *  const deferred = defer()
 *
 *  setTimeout(() => {
 *    if (Math.random() > 0.5) {
 *      deferred.resolve('success')
 *    } else {
 *      deferred.reject('Something went wrong')
 *    }
 *  }, 1000)
 *
 *  // we're just returning the promise, so that the caller cannot resolve/reject it
 *  return deferred.promise
 * }
 *
 * ```
 */
function defer<PromiseType>(): Deferred<PromiseType> {
  let resolve: (d: PromiseType) => void
  let reject: (d: unknown) => void
  const promise = new Promise<PromiseType>((rs, rj) => {
    resolve = (v) => {
      rs(v)
      deferred.status = 'resolved'
    }
    reject = (v) => {
      rj(v)
      deferred.status = 'rejected'
    }
  })

  const deferred: Deferred<PromiseType> = {
    resolve: resolve!,
    reject: reject!,
    promise,
    status: 'pending',
  }
  return deferred
}
