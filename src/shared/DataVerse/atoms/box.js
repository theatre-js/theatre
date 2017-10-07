import {default as AbstractAtom, type IAtom} from './utils/AbstractAtom'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import type {AddressedChangeset, True, False, MapKey, Address} from '$shared/DataVerse/types'
import type {IDerivation} from '$shared/DataVerse/derivations/types'

export type BoxAtomChangeType<V> = V
export type BoxAtomDeepChangeType<V> = AddressedChangeset & {type: 'BoxChange', newValue: BoxAtomChangeType<V>}
export type BoxAtomDeepDiffType<V> = AddressedChangeset & {type: 'BoxDiff', oldValue: V, newValue: V}

export type IBoxAtom<V> = {
  isDictAtom: False,
  isBoxAtom: True,
  isArrayAtom: False,
  _value: V,
  unboxDeep(): V,
  getValue(): V,
  set(v: V): _IBoxAtom<V>,
  deepChanges: () => Tappable<BoxAtomDeepChangeType<V>>,
  deepDiffs: () => Tappable<BoxAtomDeepDiffType<V>>,
  derivation: () => IDerivation<V>,
  changes: () => Tappable<V>,

  _setParent(p: $FixMe, key: MapKey): void,
  _unsetParent(): void,
  getAddress(): Address,
  getParent(): ?$FixMe,
}

interface _IBoxAtom<V> {
  // isBoxAtom: True,
  // _value: V,
  // unboxDeep(): V,
  // getValue(): V,
  // set(v: V): _IBoxAtom<V>,
  // deepChanges: () => Tappable<BoxAtomDeepChangeType<V>>,
  // deepDiffs: () => Tappable<BoxAtomDeepDiffType<V>>,
  // derivation: () => IDerivation<V>,
}


export class BoxAtom<V> extends AbstractAtom implements _IBoxAtom<V> {
  isBoxAtom = 'True'
  _value: V

  _changeEmitter: Emitter<BoxAtomChangeType<V>>
  changes: () => Tappable<BoxAtomChangeType<V>>

  _deepChangeEmitter: Emitter<BoxAtomDeepChangeType<V>>
  deepChanges: () => Tappable<BoxAtomDeepChangeType<V>>

  _deepDiffEmitter: Emitter<BoxAtomDeepDiffType<V>>
  deepDiffs: () => Tappable<BoxAtomDeepDiffType<V>>

  derivation: () => IDerivation<V>

  constructor(v: V): _IBoxAtom<V> {
    super()
    this._value = v
    return this
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

  getValue(): V {
    return this._value
  }

  derivation(): IDerivation<V> {
    const deriveFromBoxAtom = require('$shared/DataVerse/derivations/ofAtoms/deriveFromBoxAtom').default
    return deriveFromBoxAtom(this)
  }
}

export default function box<V>(v: V): IBoxAtom<V> {
  return (new BoxAtom(v): $IntentionalAny)
}