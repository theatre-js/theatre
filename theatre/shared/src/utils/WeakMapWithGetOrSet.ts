import type {$IntentionalAny} from './types'

export default class WeakMapWithGetOrSet<
  K extends object = {},
  V = any,
> extends WeakMap<K, V> {
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
