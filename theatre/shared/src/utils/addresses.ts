import type {
  $IntentionalAny,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
import type {ObjectAddressKey, ProjectId, SheetId, SheetInstanceId} from './ids'

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
 */
export interface SheetAddress extends ProjectAddress {
  sheetId: SheetId
  sheetInstanceId: SheetInstanceId
}

/**
 * Removes `sheetInstanceId` from an address, making it refer to
 * all instances of a certain `sheetId`
 */
export type WithoutSheetInstance<T extends SheetAddress> = Omit<
  T,
  'sheetInstanceId'
>

export type SheetInstanceOptional<T extends SheetAddress> =
  WithoutSheetInstance<T> & {sheetInstanceId?: SheetInstanceId | undefined}

/**
 * Represents the address to a Sheet's Object
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

export type PathToProp = Array<string | number>

export type PathToProp_Encoded = string

export const encodePathToProp = (p: PathToProp): PathToProp_Encoded =>
  JSON.stringify(p)

export const decodePathToProp = (s: PathToProp_Encoded): PathToProp =>
  JSON.parse(s)

/**
 * Represents the path to a certain prop of an object
 */
export interface PropAddress extends SheetObjectAddress {
  pathToProp: PathToProp
}

export interface SequenceAddress extends SheetAddress {
  sequenceName: string
}

export const getValueByPropPath = (
  pathToProp: PathToProp,
  rootVal: SerializableMap,
): undefined | SerializableValue => {
  const p = [...pathToProp]
  let cur: $IntentionalAny = rootVal

  while (p.length !== 0) {
    const key = p.shift()!

    if (cur !== null && typeof cur === 'object') {
      if (Array.isArray(cur)) {
        if (typeof key === 'number') {
          cur = cur[key]
        } else {
          return undefined
        }
      } else {
        if (typeof key === 'string') {
          cur = cur[key]
        } else {
          return undefined
        }
      }
    } else {
      return undefined
    }
  }

  return cur
}
