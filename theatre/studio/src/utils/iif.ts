/**
 * Immediately invoked function (Expression)
 *
 * For those times you want the expression block syntax from Rust.
 */
export function iif<R>(f: () => R): R {
  return f()
}
