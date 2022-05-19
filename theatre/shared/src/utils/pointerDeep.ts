import type {Pointer} from '@theatre/dataverse'
import type {PathToProp} from './addresses'
import type {$IntentionalAny} from './types'

export default function pointerDeep<T>(
  base: Pointer<T>,
  toAppend: PathToProp,
): Pointer<unknown> {
  let p = base as $IntentionalAny
  for (const k of toAppend) {
    p = p[k]
  }
  return p
}
