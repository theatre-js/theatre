import type {PathToProp} from './addresses'
import type {$FixMe, $IntentionalAny, SerializableMap} from './types'

/**
 * Mutates `base` to remove the path `path` from it. And if deleting a key makes
 * its parent object empty of keys, that parent object will be deleted too, and so on.
 *
 * If `path` is `[]`, then `base` it'll remove all props from `base`.
 *
 * Example:
 * ```ts
 * removePathFromObject({a: {b: 1, c: 2}}, ['a', 'b']) // base is mutated to: {a: {c: 2}}
 * removePathFromObject({a: {b: 1}}, ['a', 'b']) // base is mutated to: {}, because base.a is now empty.
 * ```
 */
export default function removePathFromObject(
  base: SerializableMap,
  path: PathToProp,
) {
  if (typeof base !== 'object' || base === null) return

  if (path.length === 0) {
    for (const key of Object.keys(base)) {
      delete base[key]
    }
    return
  }

  // if path is ['a', 'b', 'c'], then this will be ['a', 'b']
  const keysUpToLastKey = path.slice(0, path.length - 1)

  let cur: $IntentionalAny = base

  // we use this weakmap to be able to get the parent of a a child object
  const childToParentMapping = new WeakMap()

  // The algorithm has two passes.

  // On the first pass, we traverse the path and keep note of parent->child relationships.
  // We also can bail out early  if we find that the path doesn't exist.
  for (const key of keysUpToLastKey) {
    const parent = cur
    const child = parent[key as $FixMe]

    if (typeof child !== 'object' || child === null) {
      // the path either doesn't exist, or it doesn't point to an object, so we can just return
      return
    } else {
      // the path _does_ exist so far. let's note the parent-child relationship.
      childToParentMapping.set(child, parent)
      cur = child
    }
  }
  // if path is ['a', 'b', 'c'], then this will be ['c', 'b', 'a']
  const keysReversed = path.slice().reverse()

  // on the second pass, we traverse the path in reverse, and delete the keys,
  // and also delete the parent objects if they become empty.
  for (const key of keysReversed) {
    delete cur[key]

    // if the current object is _not_ empty, then we can stop here.
    if (Object.keys(cur).length > 0) {
      return
    } else {
      // otherwise, we need to delete the parent object too.
      cur = childToParentMapping.get(cur)!
      continue
    }
  }
}
