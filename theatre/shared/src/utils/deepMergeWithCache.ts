import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {DeepPartialOfSerializableValue, SerializableMap} from './types'

/**
 * This is like `Object.assign(base, override)`, with the following differences:
 *
 * 1. It returns a new value, instead of mutating `base`:
 * ```js
 * const cache = new WeakMap()
 * const base = {foo: 1}
 * const override = {bar: 1}
 * const result = deepMergeWithCache(base, override, cache)
 * console.log(result) // {foo: 1, bar: 1}
 * console.log(base) // base is not mutated, so: {foo: 1}
 * ```
 *
 * 2. It does a recursive merge for objects:
 * ```js
 * const cache = new WeakMap()
 * const base = {a: {b: 1}}
 * const override = {a: {b: 2}}
 * const result = deepMergeWithCache(base, override, cache)
 * console.log(result) // {a: {b: 2}}
 * ```
 *
 * 2. It uses a WeakMap to cache its results at each level. So merges are referentially stable:
 * ```js
 * const cache = new WeakMap()
 * const base = {a: {b: 1}}
 * const override1 = {a: {b: 2}}
 * const result1 = deepMergeWithCache(base, override, cache)
 * console.log(result1 === deepMergeWithCache(base, override, cache)) // true
 *
 * const override2 = {...override, c: 1}
 * const result2 = deepMergeWithCache(base, override2, cache)
 *
 * console.log(result1.a === result2.a) // logs true, because override1.a === override2.a
 * ```
 *
 * 4. Both `base` and `override` must be plain JSON values and *NO* arrays, so: `boolean, string, number, undefined, {}`
 *
 * Rationale: This is used in {@link SheetObject.getValues} to deep-merge static and sequenced
 * and other types of overrides. If we were to do a deep-merge without a cache, we'd be creating and discarding
 * several JS objects on each frame for every Theatre object, and that would pressure the GC.
 * Plus, keeping the values referentially stable helps lib authors optimize how they patch these values
 * to the rendering engine.
 */
export default function deepMergeWithCache<T extends SerializableMap>(
  base: DeepPartialOfSerializableValue<T>,
  override: DeepPartialOfSerializableValue<T>,
  cache: WeakMap<{}, unknown>,
): DeepPartialOfSerializableValue<T> {
  const _cache: WeakMap<
    SerializableMap,
    {
      override: DeepPartialOfSerializableValue<T>
      merged: DeepPartialOfSerializableValue<T>
    }
  > = cache as $IntentionalAny

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
