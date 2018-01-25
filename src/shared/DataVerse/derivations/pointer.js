// @flow
import type {MapKey, If, True, False} from '$shared/DataVerse/types'
import type {IsDictAtom, IDictAtom} from '$shared/DataVerse/atoms/dict'
import type {IsArrayAtom, IArrayAtom} from '$shared/DataVerse/atoms/array'
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

type IsPointer<V> = $ElementType<V, 'isPointer'>
type IsAtom<V> = $ElementType<V, 'isAtom'>

export type DecidePointerType<V> = If<
  IsAtom<V>,
  DecideAtomPointerType<V>,
  If<IsPointer<V>, V, void>,
>

// type DecideBoxAtomPointerType<V> =
//   If<IsPointer<V>, V,
//   IPointerToBoxAtom<V>>

type DecideAtomPointerType<V> = If<
  IsDictAtom<V>,
  IPointerToDictAtom<$ElementType<V, '_internalMap'>>,
  If<
    IsArrayAtom<V>,
    IPointerToArrayAtom<$ElementType<V, '_v'>>,
    IPointerToBoxAtom<$ElementType<V, '_value'>>,
  >,
>

// type DecideDerivationType<V> =
//   If<IsDictAtom<V>, V, void>

type BasePointer = {
  isPointer: True,
  isDictAtom: False,
  isBoxAtom: False,
  isArrayAtom: False,
  isAtom: False,
}

export type IPointerToDictAtom<O: {}> = BasePointer &
  IDerivation<IDictAtom<O>> & {
    _type: O,
    prop<K: $Keys<O>>(K): DecidePointerType<$ElementType<O, K>>,
    pointer(): IPointerToDictAtom<O>,
    index(undefined | null | number): IPointerToVoid,
  }

export type IPointerToArrayAtom<V> = BasePointer &
  IDerivation<IArrayAtom<V>> & {
    _type: V,
    prop($IntentionalAny): IPointerToVoid,
    pointer(): IPointerToArrayAtom<V>,
    index(number): DecidePointerType<V>,
  }

export type IPointerToVoid = BasePointer &
  IDerivation<void> & {
    prop($IntentionalAny): IPointerToVoid,
    pointer(): IPointerToVoid,
    index(undefined | null | number): IPointerToVoid,
  }

export type IPointerToBoxAtom<V> = BasePointer &
  IDerivation<V> & {
    _type: V,
    prop($IntentionalAny): IPointerToVoid,
    pointer(): IPointerToBoxAtom<V>,
    index(undefined | null | number): IPointerToVoid,
  }

interface _IPointer<V> {
  prop(key: MapKey): _IPointer<$FixMe>;
  index(key: number): _IPointer<$FixMe>;
  pointer(): _IPointer<V>;
  // derivation(): IDerivation<V>,
}

const noBoxAtoms = v => {
  if (v instanceof modules.box.BoxAtom) {
    return modules.deriveFromBoxAtom.default(v).flatMap(noBoxAtoms)
  } else {
    return v
  }
}

type Address =
  | {root: $FixMe, path: Array<MapKey>}
  | {
      type: 'fromParentPointer',
      parentPointer: _IPointer<$FixMe>,
      keyOrIndex: number | string,
    }

export class PointerDerivation extends AbstractDerivation
  implements _IPointer<$FixMe> {
  static NOTFOUND: void = undefined //Symbol('notfound')
  isPointer = 'True'
  _address: Address
  _internalDerivation: undefined | null | IDerivation<$FixMe>
  getValue: () => $FixMe
  inPointer = true

  constructor(address: Address) {
    super()
    // lastPointerId++
    this._address = address
    this._internalDerivation = undefined
    this._props = {}
  }

  prop(key: MapKey) {
    if (!this._props[key]) {
      this._props[key] = new PointerDerivation({
        type: 'fromParentPointer',
        parentPointer: this,
        keyOrIndex: key,
      }) // {...this._address, path: [...this._address.path, key]})
    }
    return this._props[key]
  }

  index(key: number) {
    if (!this._props[key]) {
      this._props[key] = new PointerDerivation({
        type: 'fromParentPointer',
        parentPointer: this,
        keyOrIndex: key,
      }) // {...this._address, path: [...this._address.path, key]})
    }
    return this._props[key]
    // return new PointerDerivation({...this._address, path: [...this._address.path, key]})
  }

  _makeDerivation() {
    const address = this._address
    const d =
      address.type === 'fromParentPointer'
        ? this._makeDerivationForParentPointer(
            // $FixMe
            address.parentPointer,
            // $FixMe
            address.keyOrIndex,
          )
        : this._makeDerivationForPath(address.root, address.path)

    this._addDependency(d)

    return d
  }

  _makeDerivationForParentPointer(
    parentPointer: $FixMe,
    keyOrIndex: string | number,
  ) {
    const d = parentPointer
      .flatMap(p => propify(p, keyOrIndex))
      .flatMap(noBoxAtoms)
    d.inPointer = true
    return d
  }

  _makeDerivationForPath(root: $FixMe, path: Array<string | number>) {
    let finalDerivation = modules.constant.default(root)
    finalDerivation.inPointer = true
    path.forEach(key => {
      finalDerivation = finalDerivation.flatMap(p => propify(p, key))
      finalDerivation.inPointer = true
    })

    finalDerivation = finalDerivation.flatMap(noBoxAtoms)
    finalDerivation.inPointer = true
    return finalDerivation
  }

  _getInternalDerivation(): IDerivation<$FixMe> {
    if (!this._internalDerivation) {
      this._internalDerivation = this._makeDerivation()
    }
    return this._internalDerivation
  }

  _recalculate() {
    return this._getInternalDerivation().getValue()
  }

  _keepUptodate() {
    this.getValue()
  }

  pointer() {
    return this
  }
}

const _propify = (possibleReactiveValue, key) => {
  // pointerFlatMaps++
  if (
    possibleReactiveValue === PointerDerivation.NOTFOUND ||
    possibleReactiveValue === undefined
  ) {
    return PointerDerivation.NOTFOUND
  } else if (possibleReactiveValue instanceof modules.dict.DictAtom) {
    return modules.deriveFromPropOfADictAtom.default(
      possibleReactiveValue,
      (key: $FixMe),
    )
  } else if (
    possibleReactiveValue instanceof modules.array.ArrayAtom &&
    typeof key === 'number'
  ) {
    return modules.deriveFromIndexOfArrayAtom.default(
      possibleReactiveValue,
      key,
    )
  } else if (
    possibleReactiveValue instanceof modules.PrototypalDictFace.default ||
    possibleReactiveValue instanceof PointerDerivation ||
    possibleReactiveValue instanceof modules.AbstractDerivedDict.default
  ) {
    return possibleReactiveValue.prop(key)
  } else if (possibleReactiveValue.isDerivedArray === 'True') {
    return possibleReactiveValue.index(key)
  } else {
    return undefined
  }
}

const propify = (possibleReactiveValue, key) => {
  const d = _propify(possibleReactiveValue, key)
  if (typeof d === 'object' && d.isDerivation === 'True') {
    d.inPointer = true
  }
  return d
}

export default function pointer(address: Address): mixed {
  return new PointerDerivation(address)
}

const modules = {
  constant: require('./constant'),
  deriveFromPropOfADictAtom: require('./ofAtoms/deriveFromPropOfADictAtom'),
  deriveFromIndexOfArrayAtom: require('./ofAtoms/deriveFromIndexOfArrayAtom'),
  deriveFromBoxAtom: require('./ofAtoms/deriveFromBoxAtom'),
  PrototypalDictFace: require('./prototypalDict/PrototypalDictFace'),
  AbstractDerivedDict: require('./dicts/AbstractDerivedDict'),
  box: require('$shared/DataVerse/atoms/box'),
  dict: require('$shared/DataVerse/atoms/dict'),
  array: require('$shared/DataVerse/atoms/array'),
}

// let lastPointerId = 0
// let pointerFlatMaps = 0

// setTimeout(() => {
//   console.log('pointers:', lastPointerId)
//   console.log('pointerFlatMaps:', pointerFlatMaps)
// }, 200)
