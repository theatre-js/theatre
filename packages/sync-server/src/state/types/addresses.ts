import type {
  ObjectAddressKey,
  ProjectId,
  SheetId,
  SheetInstanceId,
} from './core'
import type {PathToProp} from '@theatre/utils/pathToProp'

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
