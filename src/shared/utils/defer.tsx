interface Deferred<PromiseType> {
  resolve: (d: PromiseType) => void
  reject: (d: mixed) => void
  promise: Promise<PromiseType>
}

export function defer<PromiseType>(): Deferred<PromiseType> {
  let resolve: (d: PromiseType) => void
  let reject: (d: mixed) => void
  const promise = new Promise<PromiseType>((rs, rj) => {
    resolve = rs
    reject = rj
  })

  // @ts-ignore @ignore
  return {resolve, reject, promise}
}
