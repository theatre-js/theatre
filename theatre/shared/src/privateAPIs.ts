import type {IProject} from '@theatre/core/projects/TheatreProject'
import type Project from '@theatre/core/projects/Project'
import type Sequence from '@theatre/core/sequences/Sequence'
import type {ISequence} from '@theatre/core/sequences/TheatreSequence'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {ISheetObject} from '@theatre/core/sheetObjects/TheatreSheetObject'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import type Studio from '@theatre/studio/Studio'
import type {IStudio} from '@theatre/studio/TheatreStudio'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

const publicAPIToPrivateAPIMap = new WeakMap()

export function privateAPI(pub: IProject): Project
export function privateAPI(pub: ISheet): Sheet
export function privateAPI(pub: ISheetObject<$IntentionalAny>): SheetObject
export function privateAPI(pub: ISequence): Sequence
export function privateAPI(pub: IStudio | IStudio['ui']): Studio
export function privateAPI(pub: {}): unknown {
  return publicAPIToPrivateAPIMap.get(pub)
}

export function setPrivateAPI(pub: IProject, priv: Project): void
export function setPrivateAPI(pub: ISheet, priv: Sheet): void
export function setPrivateAPI(pub: ISequence, priv: Sequence): void
export function setPrivateAPI(
  pub: ISheetObject<$IntentionalAny>,
  priv: SheetObject,
): void
export function setPrivateAPI(pub: IStudio | IStudio['ui'], priv: Studio): void
export function setPrivateAPI(pub: {}, priv: {}): void {
  publicAPIToPrivateAPIMap.set(pub, priv)
}
