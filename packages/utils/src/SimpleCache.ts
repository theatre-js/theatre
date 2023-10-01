import type {$IntentionalAny} from '@theatre/utils/types'

/**
 * A basic cache
 */
export default class SimpleCache {
  /**
   * NOTE this could also be a Map.
   */
  protected _values: Record<string, unknown> = {}
  constructor() {}

  /**
   * get the cache item at `key` or produce it using `producer` and cache _that_.
   *
   * Note that this won't work if you change the producer, like `get(key, producer1); get(key, producer2)`.
   */
  get<T>(key: string, producer: () => T): T {
    if (this.has(key)) {
      return this._values[key] as $IntentionalAny
    } else {
      const cachedValue = producer()
      this._values[key] = cachedValue
      return cachedValue
    }
  }

  /**
   * Returns true if the cache has an item at `key`.
   */
  has(key: string): boolean {
    return this._values.hasOwnProperty(key)
  }
}
