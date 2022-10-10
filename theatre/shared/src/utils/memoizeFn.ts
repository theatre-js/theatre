/**
 * Memoizes a unary function using a simple weakmap.
 *
 * @example
 * ```ts
 * const fn = memoizeFn((el) => getBoundingClientRect(el))
 *
 * const b1 = fn(el)
 * const b2 = fn(el)
 * assert.equal(b1, b2)
 * ```
 */
export default function memoizeFn<K extends {}, V>(
  producer: (k: K) => V,
): (k: K) => V {
  const cache = new WeakMap<K, V>()

  return (k: K): V => {
    if (!cache.has(k)) {
      cache.set(k, producer(k))
    }
    return cache.get(k)!
  }
}
