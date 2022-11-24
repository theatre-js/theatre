import type {ObjectAddressKey, ProjectId, SheetId, SheetInstanceId} from './ids'
import memoizeFn from './memoizeFn'
import type {Nominal} from './Nominal'

/**
 * Addresses are used to identify projects, sheets, objects, and other things.
 *
 * For example, a project's address looks like `{projectId: 'my-project'}`, and a sheet's
 * address looks like `{projectId: 'my-project', sheetId: 'my-sheet'}`.
 *
 * As you see, a Sheet's address is a superset of a Project's address. This is so that we can
 * use the same address type for both. All addresses follow the same rule. An object's address
 * extends its sheet's address, which extends its project's address.
 *
 * For example, generating an object's address from a sheet's address is as simple as `{...sheetAddress, objectId: 'my-object'}`.
 *
 * Also, if you need the projectAddress of an object, you can just re-use the object's address:
 * `aFunctionThatRequiresProjectAddress(objectAddress)`.
 */

/**
 * Represents the address to a project
 */
export interface ProjectAddress {
  projectId: ProjectId
}

/**
 * Represents the address to a specific instance of a Sheet
 *
 * @example
 * ```ts
 * const sheet = project.sheet('a sheet', 'some instance id')
 * sheet.address.sheetId === 'a sheet'
 * sheet.address.sheetInstanceId === 'sheetInstanceId'
 * ```
 *
 * See {@link WithoutSheetInstance} for a type that doesn't include the sheet instance id.
 */
export interface SheetAddress extends ProjectAddress {
  sheetId: SheetId
  sheetInstanceId: SheetInstanceId
}

/**
 * Removes `sheetInstanceId` from an address, making it refer to
 * all instances of a certain `sheetId`.
 *
 * See {@link SheetAddress} for a type that includes the sheet instance id.
 */
export type WithoutSheetInstance<T extends SheetAddress> = Omit<
  T,
  'sheetInstanceId'
>

export type SheetInstanceOptional<T extends SheetAddress> =
  WithoutSheetInstance<T> & {sheetInstanceId?: SheetInstanceId | undefined}

/**
 * Represents the address to a Sheet's Object.
 *
 * It includes the sheetInstance, so it's specific to a single instance of a sheet. If you
 * would like an address that doesn't include the sheetInstance, use `WithoutSheetInstance<SheetObjectAddress>`.
 */
export interface SheetObjectAddress extends SheetAddress {
  /**
   * The key of the object.
   *
   * @example
   * ```ts
   * const obj = sheet.object('foo', {})
   * obj.address.objectKey === 'foo'
   * ```
   */
  objectKey: ObjectAddressKey
}

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
 * Represents the path to a certain prop of an object
 */
export interface PropAddress extends SheetObjectAddress {
  pathToProp: PathToProp
}

/**
 * Represents the address of a certain sequence of a sheet.
 *
 * Since currently sheets are single-sequence only, `sequenceName` is always `'default'` for now.
 */
export interface SequenceAddress extends SheetAddress {
  sequenceName: string
}

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
