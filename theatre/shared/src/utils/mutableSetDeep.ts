import type {Pointer} from '@theatre/dataverse'
import {getPointerParts, pointer} from '@theatre/dataverse'
import lodashSet from 'lodash-es/set'

/**
 * Like `lodash.set`, but type-safe, as it uses `Pointer` instead of string/array.
 *
 * `getPointer` is a function that takes a pointer to `obj`, and returns a pointer
 * to the path that you want to set. This API looks funny but it is actually convenient
 * to mutate values type-safe, as you can see in the example below:
 *
 * ```ts
 * mutableSetDeep({a: {b: 1}}, (p) => p.a.b, 2) // {a: {b: 2}}
 * ```
 */
export default function mutableSetDeep<O extends {}, T>(
  obj: O,
  getPointer: (p: Pointer<O>) => Pointer<T>,
  val: T,
) {
  const rootPointer = pointer<O>({root: {}, path: []})
  const deepPointer = getPointer(rootPointer)

  lodashSet(obj, getPointerParts(deepPointer).path, val)
}
