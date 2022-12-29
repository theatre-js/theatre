import type {PathToProp} from './addresses'
import type {$IntentionalAny, SerializableMap} from './types'

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
export default function forEachDeep<
  Primitive extends string | number | boolean,
>(
  m: SerializableMap<Primitive> | Primitive | undefined | unknown,
  fn: (value: Primitive, path: PathToProp) => void,
  startingPath: PathToProp = [],
): void {
  if (typeof m === 'object' && m) {
    for (const [key, value] of Object.entries(m)) {
      forEachDeep(value!, fn, [...startingPath, key])
    }
  } else if (m === undefined || m === null) {
    return
  } else {
    fn(m as $IntentionalAny as Primitive, startingPath)
  }
}
