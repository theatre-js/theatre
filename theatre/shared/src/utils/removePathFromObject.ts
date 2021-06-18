import type {PathToProp} from './addresses'
import type {$FixMe, $IntentionalAny, SerializableMap} from './types'

export default function removePathFromObject(
  base: SerializableMap,
  path: PathToProp,
) {
  if (typeof base !== 'object' || base === null) return

  if (path.length === 0) {
    const keys = Object.keys(base)
    for (const key of keys) {
      delete base[key]
    }
    return
  }

  const keysUpToLastKey = path.slice(0, path.length - 1)
  let cur: $IntentionalAny = base
  const childToParentMapping = new WeakMap()

  for (const key of keysUpToLastKey) {
    const parent = cur
    const child = parent[key as $FixMe]

    if (typeof child !== 'object' || child === null) {
      return
    } else {
      childToParentMapping.set(child, parent)
      cur = child
    }
  }
  const keysReversed = path.slice().reverse()
  for (const key of keysReversed) {
    delete cur[key]
    if (Object.keys(cur).length === 0) {
      cur = childToParentMapping.get(cur)!
      continue
    } else {
      return
    }
  }
}
