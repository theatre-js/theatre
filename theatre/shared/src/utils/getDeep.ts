import lodashGet from 'lodash-es/get'
import type {PathToProp} from './addresses'
import type {SerializableValue} from './types'

export default function getDeep(
  v: SerializableValue,
  path: PathToProp,
): unknown {
  if (path.length === 0) return v
  return lodashGet(v, path)
}
