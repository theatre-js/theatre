export interface Deferred<PromiseType> {
  resolve: (d: PromiseType) => void
  reject: (d: unknown) => void
  promise: Promise<PromiseType>
  status: 'pending' | 'resolved' | 'rejected'
  currentValue: PromiseType | undefined
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
export function defer<PromiseType>(): Deferred<PromiseType> {
  let resolve: (d: PromiseType) => void
  let reject: (d: unknown) => void
  const promise = new Promise<PromiseType>((rs, rj) => {
    resolve = (v) => {
      rs(v)
      deferred.status = 'resolved'
      deferred.currentValue = v
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
    currentValue: undefined,
  }
  return deferred
}
