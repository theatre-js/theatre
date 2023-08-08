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
 * Returns an object that deep-equals `override`, but uses as much of the references from `base` as possible.
 *
 * It's better to explain this with a few examples:
 * ```ts
 * const base =     {a: {a1: 1}, b: 1}
 * const override = {a: {a1: 1}, b: 2} // notice how the value of b is different, but a deep-equals the value of a in base
 * const result = minimalOverride(base, override)
 * console.log(result === base) // false
 * console.log(result === override) // false
 * console.log(result.a === base.a) // true (base.a was re-used, because it deep-equals override.a)
 *
 * // Another example:
 * const base =     {a: {a1: 1}, b: 1}
 * const override = {a: {a1: 2}, b: 1} // notice how the value of a does not deep-equal the value of a in base
 * const result = minimalOverride(base, override)
 * console.log(result === base) // false
 * console.log(result === override) // false
 * console.log(result.a === base.a) // false
 * console.log(result.a === override.a) // true (override.a is used here, because it does not deep-equal base.a)
 * ```
 *
 * @remarks
 * We don't use this function anymore, but we're keeping it around as it's likely to be used again in the future.
 *
 * The way it used to be used, was in `transactionApi.set()`. Consider the following example:
 * ```ts
 * studio.transaction(({set}) => {
 *   set(light.props, {position: {x: 1, y: 2}, intensity: 1})
 * })
 *
 *  studio.transaction(({set}) => {
 *   // Notice that props.position is the same as before. We just want to change the intensity in this transaction.
 *   // So what will actually happen is that props.position will be re-used and untouched (and won't end up in the transaction record),
 *   // and this transaction will only touch the value for props.intensity.
 *   set(light.props, {position: {x: 1, y: 2}, intensity: 2})
 * })
 * ```
 */
export default function minimalOverride<T extends {}>(base: T, override: T): T {
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
