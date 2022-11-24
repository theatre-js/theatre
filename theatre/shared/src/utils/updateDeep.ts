import type {$FixMe, $IntentionalAny} from './types'

/**
 * Returns a new object with the value at `path` replaced with the result of `reducer(oldValue)`.
 *
 * Example:
 * ```ts
 * updateDeep({a: {b: 1}}, ['a', 'b'], (x) => x + 1) // {a: {b: 2}}
 * updateDeep({a: {b: 1}}, [], (x) => Object.keys(x).length) // 1
 * updateDeep({a: {b: 1}}, ['a', 'c'], (x) => (x ?? 0) + 1) // {a: {b: 1, c: 1}}
 * ```
 */
export default function updateDeep<S>(
  obj: S,
  path: (string | number | undefined)[],
  reducer: (...args: $IntentionalAny[]) => $IntentionalAny,
): S {
  if (path.length === 0) return reducer(obj)
  return hoop(obj, path as $IntentionalAny, reducer)
}

const hoop = (
  s: $FixMe,
  path: (string | number)[],
  reducer: $FixMe,
): $FixMe => {
  if (path.length === 0) {
    return reducer(s)
  }
  if (Array.isArray(s)) {
    let [index, ...restOfPath] = path
    index = parseInt(String(index), 10)
    if (isNaN(index)) index = 0
    const oldVal = s[index]
    const newVal = hoop(oldVal, restOfPath, reducer)
    if (oldVal === newVal) return s
    const newS = [...s]
    newS.splice(index, 1, newVal)
    return newS
  } else if (typeof s === 'object' && s !== null) {
    const [key, ...restOfPath] = path
    const oldVal = s[key]
    const newVal = hoop(oldVal, restOfPath, reducer)
    if (oldVal === newVal) return s
    const newS = {...s, [key]: newVal}
    return newS
  } else {
    const [key, ...restOfPath] = path

    return {[key]: hoop(undefined, restOfPath, reducer)}
  }
}
