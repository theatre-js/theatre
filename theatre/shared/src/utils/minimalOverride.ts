import isPlainObject from 'lodash-es/isPlainObject'
import type {$IntentionalAny} from './types'

enum ValueType {
  Opaque = 0,
  Array = 1,
  Object = 2,
}

function typeOfValue(v: unknown): ValueType {
  if (typeof v === 'object' && v !== null) {
    if (Array.isArray(v)) {
      return ValueType.Array
    } else if (isPlainObject(v)) {
      return ValueType.Object
    } else {
      return ValueType.Opaque
    }
  } else {
    return ValueType.Opaque
  }
}

/**
 * @todo explain what this does.
 */
export default function minimalOverride<T>(base: T, override: T): T {
  const typeofOverride = typeOfValue(override)
  if (typeofOverride === ValueType.Opaque) {
    return override
  }

  const typeofBase = typeOfValue(base)

  if (base === override) return override
  if (typeofOverride !== typeofBase) return override

  if (typeofOverride === ValueType.Object) {
    return minimalOverrideObject(base, override)
  } else {
    return minimalOverrideArray(
      base as $IntentionalAny,
      override,
    ) as $IntentionalAny
  }
}

function minimalOverrideObject<T extends {}>(base: T, override: T): T {
  const o: $IntentionalAny = {}
  let atLeastOneKeyWasDifferent = false
  const keysOfOverride = Object.keys(override) as Array<keyof T>
  for (const key of keysOfOverride) {
    const baseVal = base[key]
    const overrideVal = override[key]
    const minimalOverrideVal = minimalOverride(baseVal, overrideVal)
    o[key] = minimalOverrideVal
    if (minimalOverrideVal !== baseVal) {
      atLeastOneKeyWasDifferent = true
    }
  }

  if (atLeastOneKeyWasDifferent) {
    return o
  } else {
    if (Object.keys(base).length === keysOfOverride.length) {
      return base
    } else {
      return o
    }
  }
}

function minimalOverrideArray<T extends $IntentionalAny[]>(
  base: T,
  override: T,
): T {
  if (base.length !== override.length) return override
  // Arrays are expected to only hold opaque values, so we'll only
  // check for shallow equality here.
  return base.every((val, i) => val === override[i]) ? base : override
}
