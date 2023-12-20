export function iif<F extends () => any>(fn: F): ReturnType<F> {
  return fn()
}
