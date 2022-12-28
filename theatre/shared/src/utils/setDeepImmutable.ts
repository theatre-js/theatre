import type {PathToProp} from './addresses'
import type {$IntentionalAny} from './types'
import updateImmutable from './updateDeep'

/**
 * Returns an immutable clone of `obj`, with its `path` replaced with `replace`. This is _NOT_ type-safe, so use with caution.
 *
 * TODO Make a type-safe version of this, like ./mutableSetDeep.ts.
 */
export default function setDeepImmutable<S>(
  obj: S,
  path: PathToProp,
  replace: $IntentionalAny,
): S {
  return updateImmutable(obj, path, () => replace) as $IntentionalAny as S
}
