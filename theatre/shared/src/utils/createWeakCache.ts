export default function createWeakCache(): WeakCache {
  const cache = new Map()
  const cleanup = new FinalizationRegistry((key) => {
    const ref = cache.get(key)
    if (ref && !ref.deref()) cache.delete(key)
  })

  return function getOrSet<T extends {}>(key: string, producer: () => T): T {
    const ref = cache.get(key)
    if (ref) {
      const cached = ref.deref()
      if (cached !== undefined) return cached
    }

    const fresh = producer()
    cache.set(key, new WeakRef(fresh))
    cleanup.register(fresh, key)
    return fresh
  }
}

export interface WeakCache {
  <T extends {}>(key: string, producer: () => T): T
}
