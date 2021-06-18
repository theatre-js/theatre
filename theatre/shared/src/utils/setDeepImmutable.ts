import type {$IntentionalAny} from './types'
import updateImmutable from './updateDeep'

export default function setDeepImmutable<S>(
  state: S,
  path: (string | number)[],
  replace: $IntentionalAny,
): S {
  return updateImmutable(state, path, () => replace) as $IntentionalAny as S
}
