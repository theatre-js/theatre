// @flow
import {default as Atom, type IAtom} from './utils/Atom'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import type {AddressedChangeset} from '$shared/DataVerse/types'

export type BoxAtomChangeType<V> = V
export type BoxAtomDeepChangeType<V> = AddressedChangeset & {type: 'BoxChange', newValue: BoxAtomChangeType<V>}
export type BoxAtomDeepDiffType<V> = AddressedChangeset & {type: 'BoxDiff', oldValue: V, newValue: V}

export interface IBoxAtom<V> extends IAtom {
  isSingleAtom: true,
  unboxDeep(): V,
  set(v: V): IBoxAtom<V>,
  unbox(): V,
  chnages: () => Tappable<BoxAtomChangeType<V>>,
  deepChanges: () => Tappable<BoxAtomDeepChangeType<V>>,
  deepDiffs: () => Tappable<BoxAtomDeepDiffType<V>>,
}


export default class BoxAtom<V> extends Atom implements IBoxAtom<V> {
  isSingleAtom = true
  _value: V

  _changeEmitter: Emitter<BoxAtomChangeType<V>>
  chnages: () => Tappable<BoxAtomChangeType<V>>

  _deepChangeEmitter: Emitter<BoxAtomDeepChangeType<V>>
  deepChanges: () => Tappable<BoxAtomDeepChangeType<V>>

  _deepDiffEmitter: Emitter<BoxAtomDeepDiffType<V>>
  deepDiffs: () => Tappable<BoxAtomDeepDiffType<V>>

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

  unbox(): V {
    return this._value
  }

  changesWithInitial(): $FixMe {

  }

  derivation() {
    const DerivationOfABoxAtom = require('$shared/DataVerse/derivations/DerivationOfABoxAtom').default
    return new DerivationOfABoxAtom(this)
  }
}
