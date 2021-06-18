import type {Pointer} from '@theatre/dataverse'
import type {PathToProp} from './addresses'
import type {$IntentionalAny} from './types'

export default function pointerDeep(
  base: Pointer<$IntentionalAny>,
  toAppend: PathToProp,
): Pointer<unknown> {
  let p = base
  for (const k of toAppend) {
    p = p[k]
  }
  return p
}
