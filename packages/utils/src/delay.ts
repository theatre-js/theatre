const delay = (dur: number, abortSignal?: AbortSignal) =>
  abortSignal ? delayWithAbort(dur, abortSignal) : delayWithoutAbort(dur)

function delayWithoutAbort(dur: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, dur)
  })
}

function delayWithAbort(dur: number, abortSignal: AbortSignal) {
  return new Promise((resolve, reject) => {
    let pending = true
    const timeout = setTimeout(() => {
      pending = false
      resolve(void 0)
    }, dur)

    const onAbort = () => {
      if (!pending) return
      pending = false
      clearTimeout(timeout)
      reject(new Error('Aborted'))
      abortSignal.removeEventListener('abort', onAbort)
    }
    abortSignal.addEventListener('abort', onAbort)
  })
}

export default delay
