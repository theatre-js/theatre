import type {$IntentionalAny} from '@theatre/utils/types'

/**
 * A wrapper around a WeakMap that adds a convenient `getOrSet` method.
 */
export default class WeakMapWithGetOrSet<
  K extends object = {},
  V = any,
> extends WeakMap<K, V> {
  /**
   * get the cache item at `key` or produce it using `producer` and cache _that_.
   *
   * Note that this won't work if you change the producer, like `getOrSet(key, producer1); getOrSet(key, producer2)`.
   */
  getOrSet<T extends V>(key: K, producer: () => T): T {
    if (this.has(key)) {
      return this.get(key) as $IntentionalAny
    } else {
      const cachedValue = producer()
      this.set(key, cachedValue)
      return cachedValue
    }
  }
}
