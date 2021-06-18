import type {DeepPartialOfSerializableValue, SerializableMap} from './types'

export default function deepMerge<T extends SerializableMap>(
  base: T,
  override: DeepPartialOfSerializableValue<T>,
): T {
  const merged = {...base}
  for (const key of Object.keys(override)) {
    const valueInOverride = override[key]
    const valueInBase = base[key]

    // @ts-ignore @todo
    merged[key] =
      typeof valueInOverride === 'object' && typeof valueInBase === 'object'
        ? deepMerge(valueInBase, valueInOverride)
        : valueInOverride
  }

  return merged
}
