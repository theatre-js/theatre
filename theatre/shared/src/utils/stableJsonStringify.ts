import {isPlainObject} from 'lodash-es'
import type {$IntentionalAny} from './types'

/**
 * Like JSON.stringify, but sorts the keys of objects so the stringified value
 * remains stable if the keys are set in different order.
 *
 * Credit: https://github.com/tannerlinsley/react-query/blob/1896ca27abf46d14df7c6f463d98eb285b8d9492/src/core/utils.ts#L301
 */
export default function stableValueHash(value: $IntentionalAny): string {
  return JSON.stringify(deepSortValue(value))
}

function deepSortValue<S extends $IntentionalAny>(val: S): S {
  return isPlainObject(val)
    ? Object.keys(val as $IntentionalAny)
        .sort()
        .reduce((result, key) => {
          result[key] = deepSortValue((val as $IntentionalAny)[key])
          return result
        }, {} as any)
    : Array.isArray(val)
    ? val.map(deepSortValue)
    : val
}
