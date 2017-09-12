// @flow
import {default as Atom, type IAtom} from './utils/Atom'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import {type AddressedChangeset} from '$shared/DataVerse/types'

type DeepChangeType<V> = AddressedChangeset & {type: 'AtomChange', newValue: V}
type DeepDiffType<V> = AddressedChangeset & {type: 'AtomDiff', oldValue: V, newValue: V}

export interface IBoxAtom<V> extends IAtom {
  isSingleAtom: true,
  unboxDeep(): V,
  set(v: V): IBoxAtom<V>,
  get(): V,
  chnages: () => Tappable<V>,
  deepChanges: () => Tappable<DeepChangeType<V>>,
  deepDiffs: () => Tappable<DeepDiffType<V>>,
}


export default class BoxAtom<V> extends Atom implements IBoxAtom<V> {
  isSingleAtom = true
  _value: V
  _changeEmitter: Emitter<V>
  _deepChangeEmitter: Emitter<DeepChangeType<V>>
  _deepDiffEmitter: Emitter<DeepDiffType<V>>
  chnages: () => Tappable<V>
  deepChanges: () => Tappable<DeepChangeType<V>>
  deepDiffs: () => Tappable<DeepDiffType<V>>

  constructor(v: V) {
    super()
    this._value = v
  }

  unboxDeep(): V {
    return this._value
  }

  set(value: V): Atom<V> {
    const oldValue = this._value
    this._value = value

    if (this._changeEmitter.hasTappers()) {
      this._changeEmitter.emit(value)
    }

    if (this._deepChangeEmitter.hasTappers()) {
      this._deepChangeEmitter.emit({address: [], type: 'AtomChange', newValue: value})
    }

    if (this._deepDiffEmitter.hasTappers()) {
      this._deepDiffEmitter.emit({address: [], type: 'AtomDiff', oldValue: oldValue, newValue: value})
    }

    return this
  }

  get(): V {
    return this._value
  }
}