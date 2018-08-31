import updateImmutable from './updateImmutable'

export default function setImmutable<S>(
  path: Array<string | number>,
  replace: $IntentionalAny,
  state: S,
): S {
  return updateImmutable(path, () => replace, state)
}
