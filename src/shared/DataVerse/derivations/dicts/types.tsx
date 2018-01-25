// @flow
import {AbstractDerivation} from '../types'
import {default as Tappable} from '$shared/DataVerse/utils/Tappable'
// import type {IPointer} from '../pointer'

export type ChangeType<O> = {
  addedKeys: Array<keyof O>
  deletedKeys: Array<keyof O>
}

export interface IDerivedDict<O> {
  prop<K extends keyof O>(k: K): AbstractDerivation<$FixMe>
  changes(): Tappable<ChangeType<O>>
  keys(): Array<keyof O>
  pointer(): $FixMe
  mapValues(f: $FixMe): IDerivedDict<$FixMe>
  extend(f: $FixMe): IDerivedDict<$FixMe>
}
