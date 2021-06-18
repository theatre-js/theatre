import type {PathToProp} from './addresses'
import type {$IntentionalAny, SerializableMap} from './types'

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
  } else if (typeof m === 'undefined' || m === null) {
    return
  } else {
    fn(m as $IntentionalAny as Primitive, startingPath)
  }
}
