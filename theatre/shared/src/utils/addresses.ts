import type {
  $IntentionalAny,
  SerializableMap,
  SerializableValue,
} from '@theatre/shared/utils/types'
export interface ProjectAddress {
  projectId: string
}

export interface SheetAddress extends ProjectAddress {
  sheetId: string
  sheetInstanceId: string
}

export type WithoutSheetInstance<T extends SheetAddress> = Omit<
  T,
  'sheetInstanceId'
>

export type SheetInstanceOptional<T extends SheetAddress> =
  WithoutSheetInstance<T> & {sheetInstanceId?: string | undefined}

export interface SheetObjectAddress extends SheetAddress {
  objectKey: string
}

export type PathToProp = Array<string | number>

export type PathToProp_Encoded = string

export const encodePathToProp = (p: PathToProp): PathToProp_Encoded =>
  JSON.stringify(p)

export const decodePathToProp = (s: PathToProp_Encoded): PathToProp =>
  JSON.parse(s)

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
