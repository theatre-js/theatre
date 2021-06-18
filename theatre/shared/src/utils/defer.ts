export interface Deferred<PromiseType> {
  resolve: (d: PromiseType) => void
  reject: (d: unknown) => void
  promise: Promise<PromiseType>
  status: 'pending' | 'resolved' | 'rejected'
}

export function defer<PromiseType>(): Deferred<PromiseType> {
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
