// @flow
import {default as Atom, type IAtom} from './utils/Atom'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import type {AddressedChangeset} from '$shared/DataVerse/types'

export type ChangeType<V> = V
export type DeepChangeType<V> = AddressedChangeset & {type: 'BoxChange', newValue: ChangeType<V>}
export type DeepDiffType<V> = AddressedChangeset & {type: 'BoxDiff', oldValue: V, newValue: V}

export interface IBoxAtom<V> extends IAtom {
  isSingleAtom: true,
  unboxDeep(): V,
  set(v: V): IBoxAtom<V>,
  get(): V,
  chnages: () => Tappable<ChangeType<V>>,
  deepChanges: () => Tappable<DeepChangeType<V>>,
  deepDiffs: () => Tappable<DeepDiffType<V>>,
}


export default class BoxAtom<V> extends Atom implements IBoxAtom<V> {
  isSingleAtom = true
  _value: V

  _changeEmitter: Emitter<ChangeType<V>>
  chnages: () => Tappable<ChangeType<V>>

  _deepChangeEmitter: Emitter<DeepChangeType<V>>
  deepChanges: () => Tappable<DeepChangeType<V>>

  _deepDiffEmitter: Emitter<DeepDiffType<V>>
  deepDiffs: () => Tappable<DeepDiffType<V>>

  constructor(v: V) {
    super()
    this._value = v
  }

  unboxDeep(): V {
    return this._value
  }

  set(value: V): this {
    const oldValue = this._value
    this._value = value

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(value)
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'BoxChange', newValue: value})
    }

    if (this._deepDiffEmitter.hasTappers()) {
      this._deepDiffEmitter.emit({address: [], type: 'BoxDiff', oldValue: oldValue, newValue: value})
    }

    return this
  }

  get(): V {
    return this._value
  }
}