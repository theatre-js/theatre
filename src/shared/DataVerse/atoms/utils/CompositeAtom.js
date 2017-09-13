// @flow
import {default as Atom, type IAtom} from './Atom'
import type {DeepChangeType as BoxAtomDeepChangeType, DeepDiffType as BoxAtomDeepDiffType} from '../BoxAtom'
import type {DeepChangeType as MapAtomDeepChangeType, DeepDiffType as MapAtomDeepDiffType} from '../MapAtom'
import type {DeepChangeType as ArrayAtomDeepChangeType, DeepDiffType as ArrayAtomDeepDiffType} from '../ArrayAtom'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'

export type AllDeepChangeTypes = BoxAtomDeepChangeType<any> | MapAtomDeepChangeType<any> | ArrayAtomDeepChangeType<any>
export type AllDeepDiffTypes = BoxAtomDeepDiffType<any> | MapAtomDeepDiffType<any> | ArrayAtomDeepDiffType<any>

export interface ICompositeAtom extends IAtom {
  isCompositeAtom: true,
  deepChanges(): Tappable<AllDeepChangeTypes>, // deep changes. Includes an address
  deepDiffs(): Tappable<AllDeepDiffTypes>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  _adopt(key: string | number, value: IAtom): void,
  _unadopt(key: string | number, value: IAtom): void,
}

export default class CompositeAtom extends Atom implements ICompositeAtom {
  isCompositeAtom = true
  _deepChangeUntappersForEachChild: *
  _deepDiffUntappersForEachChild: *

  _deepChangeEmitter: Emitter<AllDeepChangeTypes>
  deepChanges: () => Tappable<AllDeepChangeTypes>

  _deepDiffEmitter: Emitter<AllDeepDiffTypes>
  deepDiffs: () => Tappable<AllDeepDiffTypes>

  constructor() {
    super()
    this._deepChangeUntappersForEachChild = new Map()
    this._deepDiffUntappersForEachChild = new Map()
  }

  _keyOf(key: string | number, ref: IAtom) {
    return key
  }

  _adopt(key: string | number, ref: IAtom) {
    ref._setParent(this)

    this._deepChangeUntappersForEachChild.set(ref, ref.deepChanges().tap((change) => {
      this._deepChangeEmitter.emit({...change, address: [this._keyOf(key, ref), ...change.address]})
    }))

    this._deepDiffUntappersForEachChild.set(ref, ref.deepDiffs().tap((diff) => {
      this._deepDiffEmitter.emit({...diff, address: [this._keyOf(key, ref), ...diff.address]})
    }))

  }

  _unadopt(key: string | number, ref: IAtom) {
    ref._unsetParent()
    // $FlowIgnore
    this._deepChangeUntappersForEachChild.get(ref)()
    this._deepChangeUntappersForEachChild.delete(ref)
    // $FlowIgnore
    this._deepDiffUntappersForEachChild.get(ref)()
    this._deepDiffUntappersForEachChild.delete(ref)
  }
}