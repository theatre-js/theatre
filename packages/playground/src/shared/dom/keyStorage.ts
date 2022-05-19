export interface KeyStorage<T> {
  removeItem(): void
  setItem(value: T): void
  getItem(): T | undefined
  getOrSet(orElse: () => T): T
}

/** `T` must work with JSON.stringify */
export function keyStorage<T>(
  storage: Storage,
  key: string,
  parse: (value: unknown) => T,
): KeyStorage<T> {
  return {
    removeItem() {
      storage.removeItem(key)
    },
    setItem(value: T) {
      storage.setItem(key, JSON.stringify(value))
    },
    getItem(): T | undefined {
      const value = storage.getItem(key)
      try {
        if (value != null) {
          const found = JSON.parse(value)
          return parse(found)
        }
      } catch (err) {
        console.error(`clearing "${key}" value due to parsing error`, {
          found: value,
          err,
          parse,
        })
        storage.removeItem(key)
      }
      return undefined
    },
    getOrSet(orElse) {
      const value = storage.getItem(key)
      try {
        if (value != null) {
          const found = JSON.parse(value)
          return parse(found)
        }
      } catch (err) {
        console.error(
          `generating new default "${key}" value due to parsing error`,
          {found: value, err, check: parse},
        )
        storage.removeItem(key)
      }
      const newValue = orElse()
      storage.setItem(key, JSON.stringify(newValue))
      return newValue
    },
  }
}
