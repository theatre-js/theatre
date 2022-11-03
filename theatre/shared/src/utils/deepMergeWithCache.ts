import type {DeepPartialOfSerializableValue, SerializableMap} from './types'

/**
 *
 * say `base = {position: {x: 10}, rotation: {x: 0, y: 0, z: 0}}`
 * and `override = {position: {x: 20}, rotation: {x: 0, y: 0, z: 0}}`
 * then this function merges them while ensuring `base.rotation === override.rotation`
 * i.e. it preserves referencial equality of objects in base as long as override's objects doesn't
 * have different values.
 *
 */
export default function deepMergeWithCache<T extends SerializableMap>(
  base: T,
  override: DeepPartialOfSerializableValue<T>,
  cache: WeakMap<SerializableMap, {override: T; merged: T}>,
): T {
  const possibleCachedValue = cache.get(base)

  if (possibleCachedValue && possibleCachedValue.override === override) {
    return possibleCachedValue.merged
  }

  const merged = {...base}
  for (const key of Object.keys(override)) {
    const valueInOverride = override[key]
    const valueInBase = base[key]

    // @ts-ignore @todo
    merged[key] =
      typeof valueInOverride === 'object' && typeof valueInBase === 'object'
        ? deepMergeWithCache(valueInBase, valueInOverride, cache)
        : valueInOverride === undefined
        ? valueInBase
        : valueInOverride
  }

  cache.set(base, {override, merged})
  return merged
}
