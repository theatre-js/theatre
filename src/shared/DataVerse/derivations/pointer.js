// @flow
import type {Address, MapKey} from '$shared/DataVerse/types'
import AbstractDerivation from './AbstractDerivation'
// import * as D from '$shared/DataVerse'
import type {IDerivation} from './types'

export interface IPointer<V> extends IDerivation<V> {
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
      // $FixMe
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

export default function pointer(address: Address): IPointer<$FixMe> {
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