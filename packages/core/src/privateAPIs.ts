import type Project from '@theatre/core/projects/Project'
import type Sequence from '@theatre/core/sequences/Sequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {RafDriverPrivateAPI} from './rafDrivers'
import type {
  IProject,
  IRafDriver,
  ISequence,
  ISheet,
  ISheetObject,
  UnknownShorthandCompoundProps,
} from './types/public'
import type {$IntentionalAny} from '@theatre/core/types/public'

const publicAPIToPrivateAPIMap = new WeakMap()

/**
 * Given a public API object, returns the corresponding private API object.
 */
export function privateAPI<P extends {type: string}>(
  pub: P,
): P extends IProject
  ? Project
  : P extends ISheet
    ? Sheet
    : P extends ISheetObject<$IntentionalAny>
      ? SheetObject
      : P extends ISequence
        ? Sequence
        : P extends IRafDriver
          ? RafDriverPrivateAPI
          : never {
  return publicAPIToPrivateAPIMap.get(pub)
}

/**
 * Notes the relationship between a public API object and its corresponding private API object,
 * so that `privateAPI` can find it.
 */
export function setPrivateAPI(pub: IProject, priv: Project): void
export function setPrivateAPI(pub: ISheet, priv: Sheet): void
export function setPrivateAPI(pub: ISequence, priv: Sequence): void
export function setPrivateAPI(pub: IRafDriver, priv: RafDriverPrivateAPI): void
export function setPrivateAPI<Props extends UnknownShorthandCompoundProps>(
  pub: ISheetObject<Props>,
  priv: SheetObject,
): void
export function setPrivateAPI(pub: {}, priv: {}): void {
  publicAPIToPrivateAPIMap.set(pub, priv)
}
