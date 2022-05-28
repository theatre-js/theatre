import type {Rx} from './best-practices'
import {Disposable} from './Disposable'

export function waitForNext<T>(rx: Rx<T>, {timeoutMs = 10} = {}) {
  const err = new WaitError(timeoutMs)
  let timeout: any
  const dis = new Disposable(() => (clearTimeout(timeout), (timeout = null)))
  return [
    new Promise<T>((res, rej) => {
      timeout = setTimeout(() => ((timeout = null), rej(err)), timeoutMs)
      rx.tap(dis, (value) => {
        if (timeout != null) res(value)
        dis.dispose()
      })
    }),
    dis,
  ] as const
}

// const AT_INVARIANT_RE = /^\s*at (?:Object\.)?invariant.+/m
const AT_TEST_HELPERS_RE = /^\s*at.+?\(.+expects.+/gm
const AT_WAIT_FOR_NEXT_RE = /^\s*at.+?\(.+waitForNext.+/gm

export class WaitError extends Error {
  constructor(afterMs: number) {
    super(`timed out after ${afterMs}ms`)
    this.stack = this.stack?.replace(AT_WAIT_FOR_NEXT_RE, '')
  }
}
