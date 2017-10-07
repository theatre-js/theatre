// @flow
import type {Address, MapKey, If} from '$shared/DataVerse/types'
import type {IsDictAtom, IDictAtom} from '$shared/DataVerse/atoms/dict'
import type {IsBoxAtom} from '$shared/DataVerse/atoms/box'
import type {IsArrayAtom, IArrayAtom} from '$shared/DataVerse/atoms/array'
import AbstractDerivation from './AbstractDerivation'
import type {IDerivation} from './types'

export type DecidePointerType<V> =
  If<IsDictAtom<V>, IPointerToDictAtom<$ElementType<V, '_internalMap'>>,
  If<IsArrayAtom<V>, IPointerToArrayAtom<$ElementType<V, '_v'>>,
  If<IsBoxAtom<V>, IPointerToBoxAtom<$ElementType<V, '_value'>>,
  IPointerToVoid>>>

type DecideDerivationType<V> =
  If<IsDictAtom<V>, V, void>

type IPointerToDictAtom<O: {}> = IDerivation<IDictAtom<O>> & {
  prop<K: $Keys<O>>(K): DecidePointerType<$ElementType<O, K>>,
  pointer(): IPointerToDictAtom<O>,
  index(?number): IPointerToVoid,
}

type IPointerToArrayAtom<V> = IDerivation<IArrayAtom<V>> & {
  prop(?MapKey): IPointerToVoid,
  pointer(): IPointerToArrayAtom<V>,
  index(number): DecidePointerType<V>,
}

type IPointerToVoid = IDerivation<void> & {
  prop(?MapKey): IPointerToVoid,
  pointer(): IPointerToVoid,
  index(?number): IPointerToVoid,
}

type IPointerToBoxAtom<V> = IDerivation<V> & {
  prop(?MapKey): IPointerToVoid,
  pointer(): IPointerToVoid,
  index(?number): IPointerToVoid,
  getValue(): V,
}

export interface IPointer<V> extends IDerivation<DecideDerivationType<V>> {
  prop(key: MapKey): IPointer<$FixMe>,
  index(key: number): IPointer<$FixMe>,
  pointer(): IPointer<V>,
}

const noBoxAtoms = (v) => {
  if (v instanceof modules.box.BoxAtom) {
    return modules.deriveFromBoxAtom.default(v).flatMap(noBoxAtoms)
  } else {
    return v
  }
}

export class PointerDerivation extends AbstractDerivation implements IPointer<$FixMe> {
  static NOTFOUND = undefined //Symbol('notfound')
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