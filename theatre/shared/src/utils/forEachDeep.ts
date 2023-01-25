import type {
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
} from '@theatre/core/propTypes'
import type {PathToProp} from './addresses'
import type {$IntentionalAny} from './types'

/**
 * Iterates recursively over all props of an object (which should be a {@link SerializableMap}) and runs `fn`
 * on each prop that has a primitive value (string/number/boolean) and is _NOT_ null/undefined.
 *
 * Example:
 * ```ts
 * forEachDeep(
 *   // The object to iterate over. The `fn` is going to be called on `b` and `c`.
 *   {a: {b: 1, c: 2, d: null, e: undefined}},
 *   // the function to run on each prop
 *   (value, pathToValue) => {
 *     console.log(value, pathToValue)
 *   },
 * // We can optionally pass a path prefix to prepend to the path of each prop
 * ['foo', 'bar'])
 *
 * // The above will log:
 * // 1 ['foo', 'bar', 'a', 'b']
 * // 2 ['foo', 'bar', 'a', 'c']
 * // Note that null and undefined values are skipped.
 * // Also note that `a` is also skippped, because it's not a primitive value.
 * ```
 */
export default function forEachPropDeep<
  Primitive extends
    | string
    | number
    | boolean
    | PropTypeConfig_AllSimples['valueType'],
>(
  m:
    | PropTypeConfig_Compound<$IntentionalAny>['valueType']
    | Primitive
    | undefined
    | unknown,
  fn: (value: Primitive, path: PathToProp) => void,
  startingPath: PathToProp = [],
): void {
  if (typeof m === 'object' && m) {
    if (isImage(m) || isRGBA(m)) {
      fn(m as $IntentionalAny as Primitive, startingPath)
      return
    }
    for (const [key, value] of Object.entries(m)) {
      forEachPropDeep(value!, fn, [...startingPath, key])
    }
  } else if (m === undefined || m === null) {
    return
  } else {
    fn(m as $IntentionalAny as Primitive, startingPath)
  }
}

const isImage = (value: unknown): value is {type: 'image'; id: string} => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.hasOwnProperty.call(value, 'type') &&
    // @ts-ignore
    value.type === 'image' &&
    Object.hasOwnProperty.call(value, 'id') &&
    // @ts-ignore
    typeof value.id === 'string' &&
    // @ts-ignore
    value.id !== ''
  )
}

const isRGBA = (
  value: unknown,
): value is {r: number; g: number; b: number; a: number} => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.hasOwnProperty.call(value, 'r') &&
    Object.hasOwnProperty.call(value, 'g') &&
    Object.hasOwnProperty.call(value, 'b') &&
    Object.hasOwnProperty.call(value, 'a') &&
    // @ts-ignore
    typeof value.r === 'number' &&
    // @ts-ignore
    typeof value.g === 'number' &&
    // @ts-ignore
    typeof value.b === 'number' &&
    // @ts-ignore
    typeof value.a === 'number'
  )
}
