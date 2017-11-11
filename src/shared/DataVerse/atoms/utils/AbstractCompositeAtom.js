import {default as AbstractAtom, type IAtom} from './AbstractAtom' // eslint-disable-line flowtype/require-valid-file-annotation
import type {BoxAtomDeepChangeType, BoxAtomDeepDiffType} from '../box'
import type {DictAtomDeepChangeType, DictAtomDeepDiffType} from '../dict'
import type {ArrayAtomDeepChangeType, ArrayAtomDeepDiffType} from '../array'
import Tappable from '$shared/DataVerse/utils/Tappable'
import Emitter from '$shared/DataVerse/utils/Emitter'
import isAtom from './isAtom'
import type {MapKey} from '$shared/DataVerse/types'

export type AllDeepChangeTypes =
  | BoxAtomDeepChangeType<any>
  | DictAtomDeepChangeType<any>
  | ArrayAtomDeepChangeType<any>
export type AllDeepDiffTypes =
  | BoxAtomDeepDiffType<any>
  | DictAtomDeepDiffType<any>
  | ArrayAtomDeepDiffType<any>

export type ICompositeAtom = IAtom & {
  isCompositeAtom: true,
  deepChanges(): Tappable<AllDeepChangeTypes>, // deep changes. Includes an address
  deepDiffs(): Tappable<AllDeepDiffTypes>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  _adopt(key: MapKey, value: IAtom): void,
  _unadopt(key: MapKey, value: IAtom): void,
}

interface _ICompositeAtom {
  // isCompositeAtom: true,
  // deepChanges(): Tappable<AllDeepChangeTypes>, // deep changes. Includes an address
  // deepDiffs(): Tappable<AllDeepDiffTypes>, // Unboxed changeset, from oldValue to newValue, including an address, deep
  // _adopt(key: MapKey, value: IAtom): void,
  // _unadopt(key: MapKey, value: IAtom): void,
  // getAddressTo(addressSoFar?: Array<MapKey>): Address,
}

export default class AbstractCompositeAtom extends AbstractAtom
  implements _ICompositeAtom {
  isCompositeAtom = true
  _deepChangeUntappersForEachChild: *
  _deepDiffUntappersForEachChild: *

  _deepChangeEmitter: Emitter<AllDeepChangeTypes>
  deepChanges: () => Tappable<AllDeepChangeTypes>

  _deepDiffEmitter: Emitter<AllDeepDiffTypes>
  deepDiffs: () => Tappable<AllDeepDiffTypes>
  _keyOfValue: () => MapKey | void

  constructor() {
    super()
    // this._deepChangeUntappersForEachChild = new Map()
    // this._deepDiffUntappersForEachChild = new Map()
  }

  _keyOf(key: MapKey) {
    return key
  }

  _adopt(key: MapKey, ref: mixed | IAtom) {
    if (!isAtom(ref)) return

    ref._setParent(this, key)

    // this._deepChangeUntappersForEachChild.set(
    //   ref,
    //   ref.deepChanges().tap(change => {
    //     this._deepChangeEmitter.emit({
    //       ...change,
    //       address: [this._keyOf(key, ref), ...change.address],
    //     })
    //   }),
    // )

    // this._deepDiffUntappersForEachChild.set(
    //   ref,
    //   ref.deepDiffs().tap(diff => {
    //     this._deepDiffEmitter.emit({
    //       ...diff,
    //       address: [this._keyOf(key, ref), ...diff.address],
    //     })
    //   }),
    // )
  }

  _unadopt(key: MapKey, ref: IAtom) {
    if (!isAtom(ref)) return
    ref._unsetParent()
    // $FlowIgnore
    // this._deepChangeUntappersForEachChild.get(ref)()
    // this._deepChangeUntappersForEachChild.delete(ref)
    // $FlowIgnore
    // this._deepDiffUntappersForEachChild.get(ref)()
    // this._deepDiffUntappersForEachChild.delete(ref)
  }
}
