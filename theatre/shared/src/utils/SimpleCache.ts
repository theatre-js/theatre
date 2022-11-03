import type {$IntentionalAny} from './types'

export default class SimpleCache {
  protected _values: Record<string, unknown> = {}
  constructor() {}

  getOrInit<T>(key: string, initializer: () => T): T {
    if (this.has(key)) {
      return this._values[key] as $IntentionalAny
    } else {
      const cachedValue = initializer()
      this._values[key] = cachedValue
      return cachedValue
    }
  }

  has(key: string): boolean {
    return this._values.hasOwnProperty(key)
  }
}
