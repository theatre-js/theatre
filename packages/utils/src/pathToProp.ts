import memoizeFn from '@theatre/utils/memoizeFn'
import type {Nominal} from '@theatre/utils/Nominal'

/**
 * This is a simple array representing the path to a prop, without specifying the object.
 */
export type PathToProp = Array<string | number>

/**
 * Just like {@link PathToProp}, but encoded as a string. Since this type is nominal,
 * it can only be generated using {@link encodePathToProp}.
 */
export type PathToProp_Encoded = Nominal<'PathToProp_Encoded'>

/**
 * Encodes a {@link PathToProp} as a string, and caches the result, so as long
 * as the input is the same, the output won't have to be re-generated.
 */
export const encodePathToProp = memoizeFn(
  (p: PathToProp): PathToProp_Encoded =>
    // we're using JSON.stringify here, but we could use a faster alternative.
    // If you happen to do that, first make sure no `PathToProp_Encoded` is ever
    // used in the store, otherwise you'll have to write a migration.
    JSON.stringify(p) as PathToProp_Encoded,
)

/**
 * The decoder of {@link encodePathToProp}.
 */
export const decodePathToProp = (s: PathToProp_Encoded): PathToProp =>
  JSON.parse(s)

/**
 * Returns true if `path` starts with `pathPrefix`.
 *
 * Example:
 * ```ts
 * const prefix: PathToProp = ['a', 'b']
 * console.log(doesPathStartWith(['a', 'b', 'c'], prefix)) // true
 * console.log(doesPathStartWith(['x', 'b', 'c'], prefix)) // false
 * ```
 */
export function doesPathStartWith(path: PathToProp, pathPrefix: PathToProp) {
  return pathPrefix.every((pathPart, i) => pathPart === path[i])
}

/**
 * Returns true if pathToPropA and pathToPropB are equal.
 */
export function arePathsEqual(
  pathToPropA: PathToProp,
  pathToPropB: PathToProp,
) {
  if (pathToPropA.length !== pathToPropB.length) return false
  for (let i = 0; i < pathToPropA.length; i++) {
    if (pathToPropA[i] !== pathToPropB[i]) return false
  }
  return true
}

/**
 * Given an array of `PathToProp`s, returns the longest common prefix.
 *
 * Example
 * ```
 * commonRootOfPathsToProps([
 *   ['a','b','c','d','e'],
 *   ['a','b','x','y','z'],
 *   ['a','b','c']
 *  ]) // = ['a','b']
 * ```
 */
export function commonRootOfPathsToProps(pathsToProps: PathToProp[]) {
  const commonPathToProp: PathToProp = []
  while (true) {
    const i = commonPathToProp.length
    let candidatePathPart = pathsToProps[0]?.[i]
    if (candidatePathPart === undefined) return commonPathToProp

    for (const pathToProp of pathsToProps) {
      if (candidatePathPart !== pathToProp[i]) {
        return commonPathToProp
      }
    }

    commonPathToProp.push(candidatePathPart)
  }
}
