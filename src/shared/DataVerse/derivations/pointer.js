// @flow
import type {Address, MapKey, If, True, False} from '$shared/DataVerse/types'
import type {IsDictAtom, IDictAtom} from '$shared/DataVerse/atoms/dict'
import type {IsBoxAtom} from '$shared/DataVerse/atoms/box'
import type {IsArrayAtom, IArrayAtom} from '$shared/DataVerse/atoms/array'
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

type IsPointer<V> = $ElementType<V, 'isPointer'>
type IsAtom<V> = $ElementType<V, 'isAtom'>

export type DecidePointerType<V> =
  If<IsAtom<V>, DecideAtomPointerType<V>,
  If<IsPointer<V>, V,
  void>>

// type DecideBoxAtomPointerType<V> =
//   If<IsPointer<V>, V,
//   IPointerToBoxAtom<V>>

type DecideAtomPointerType<V> =
  If<IsDictAtom<V>, IPointerToDictAtom<$ElementType<V, '_internalMap'>>,
  If<IsArrayAtom<V>, IPointerToArrayAtom<$ElementType<V, '_v'>>,
  IPointerToBoxAtom<$ElementType<V, '_value'>>>>

// type DecideDerivationType<V> =
//   If<IsDictAtom<V>, V, void>

type BasePointer = {
  isPointer: True,
  isDictAtom: False,
  isBoxAtom: False,
  isArrayAtom: False,
  isAtom: False,
}

type IPointerToDictAtom<O: {}> = BasePointer & IDerivation<IDictAtom<O>> & {
  _type: O,
  prop<K: $Keys<O>>(K): DecidePointerType<$ElementType<O, K>>,
  pointer(): IPointerToDictAtom<O>,
  index(?number): IPointerToVoid,
}

type IPointerToArrayAtom<V> = BasePointer & IDerivation<IArrayAtom<V>> & {
  _type: V,
  prop($IntentionalAny): IPointerToVoid,
  pointer(): IPointerToArrayAtom<V>,
  index(number): DecidePointerType<V>,
}

type IPointerToVoid = BasePointer & IDerivation<void> & {
  prop($IntentionalAny): IPointerToVoid,
  pointer(): IPointerToVoid,
  index(?number): IPointerToVoid,
}

export type IPointerToBoxAtom<V> = BasePointer & IDerivation<V> & {
  _type: V,
  prop($IntentionalAny): IPointerToVoid,
  pointer(): IPointerToVoid,
  index(?number): IPointerToVoid,
}

interface _IPointer<V> {
  prop(key: MapKey): _IPointer<$FixMe>,
  index(key: number): _IPointer<$FixMe>,
  pointer(): _IPointer<V>,
}

const noBoxAtoms = (v) => {
  if (v instanceof modules.box.BoxAtom) {
    return modules.deriveFromBoxAtom.default(v).flatMap(noBoxAtoms)
  } else {
    return v
  }
}

export class PointerDerivation extends AbstractDerivation implements _IPointer<$FixMe> {
  static NOTFOUND: void = undefined //Symbol('notfound')
  _address: Address
  _internalDerivation: ?IDerivation<$FixMe>
  getValue: () => $FixMe

  constructor(address: Address) {
    super()
    this._address = address
    this._internalDerivation = undefined
    // this._internalDerivation._addDependent(this)
  }

  prop(key: MapKey) {
    return new PointerDerivation({...this._address, path: [...this._address.path, key]})
  }

  index(key: number) {
    return new PointerDerivation({...this._address, path: [...this._address.path, key]})
  }

  _getInternalDerivation(): IDerivation<$FixMe> {
    if (!this._internalDerivation) {
      this._internalDerivation = this._makeDerivation()
    }
    return this._internalDerivation
  }

  _makeDerivation() {
    let finalDerivation = modules.constant.default(this._address.root)
    this._address.path.forEach((key) => {
      finalDerivation = finalDerivation.flatMap((possibleReactiveValue) => {
        if (possibleReactiveValue === PointerDerivation.NOTFOUND || possibleReactiveValue === undefined) {
          return PointerDerivation.NOTFOUND
        } else if (possibleReactiveValue instanceof modules.dict.DictAtom) {
          return modules.deriveFromPropOfADictAtom.default(possibleReactiveValue, (key: $FixMe))
        } else if (possibleReactiveValue instanceof modules.array.ArrayAtom && typeof key === 'number') {
          return modules.deriveFromIndexOfArrayAtom.default(possibleReactiveValue, key)
        } else if (possibleReactiveValue instanceof modules.PrototypalDictFace.default || possibleReactiveValue instanceof PointerDerivation || possibleReactiveValue instanceof modules.AbstractDerivedDict.default) {
          // $FixMe
          return possibleReactiveValue.prop(key)
        } else {
          return undefined
        }
      }).flatMap(noBoxAtoms)
    })

    this._addDependency(finalDerivation)
    // finalDerivation._addDependent(this)

    return finalDerivation
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

export default function pointer(address: Address): mixed {
  return new PointerDerivation(address)
}

const modules = {
  withDeps: require('./withDeps'),
  constant: require('./constant'),
  deriveFromPropOfADictAtom: require('./ofAtoms/deriveFromPropOfADictAtom'),
  deriveFromIndexOfArrayAtom: require('./ofAtoms/deriveFromIndexOfArrayAtom'),
  propOfDerivedDictFace: require('./dicts/propOfDerivedDictFace'),
  deriveFromBoxAtom: require('./ofAtoms/deriveFromBoxAtom'),
  PrototypalDictFace: require('./dicts/PrototypalDictFace'),
  AbstractDerivedDict: require('./dicts/AbstractDerivedDict'),
  box: require('$shared/DataVerse/atoms/box'),
  dict: require('$shared/DataVerse/atoms/dict'),
  array: require('$shared/DataVerse/atoms/array'),
}