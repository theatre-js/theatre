import type {$IntentionalAny} from './types'

export default class SimpleCache {
  protected _values: Record<string, unknown> = {}
  constructor() {}

  get<T>(key: string, producer: () => T): T {
    if (this.has(key)) {
      return this._values[key] as $IntentionalAny
    } else {
      const cachedValue = producer()
      this._values[key] = cachedValue
      return cachedValue
    }
  }

  has(key: string): boolean {
    return this._values.hasOwnProperty(key)
  }
}
