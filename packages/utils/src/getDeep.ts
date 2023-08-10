import lodashGet from 'lodash-es/get'
import type {PathToProp} from '@theatre/utils/pathToProp'
import type {SerializableValue} from '@theatre/utils/types'

/**
 * Returns the value at `path` of `v`.
 *
 * Example:
 * ```ts
 * getDeep({a: {b: 1}}, ['a', 'b']) // 1
 * getDeep({a: {b: 1}}, ['a', 'c']) // undefined
 * getDeep({a: {b: 1}}, []) // {a: {b: 1}}
 * getDeep('hello', []) // 'hello''
 * getDeep('hello', ['a']) // undefined
 * ```
 */
export default function getDeep(
  v: SerializableValue,
  path: PathToProp,
): unknown {
  if (path.length === 0) return v
  return lodashGet(v, path)
}
