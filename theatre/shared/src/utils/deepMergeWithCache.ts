import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {DeepPartialOfSerializableValue, SerializableMap} from './types'

export default function deepMergeWithCache<T extends SerializableMap>(
  base: T,
  override: DeepPartialOfSerializableValue<T>,
  cache: WeakMap<{}, unknown>,
): T {
  const _cache: WeakMap<SerializableMap, {override: T; merged: T}> =
    cache as $IntentionalAny

  const possibleCachedValue = _cache.get(base)

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
