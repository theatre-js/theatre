import {MapKey} from '$shared/DataVerse/types'
import AbstractDerivation from './AbstractDerivation'
import {
  DerivationTypeOfPointerType,
  IndexOfPointer,
  PropOfPointer,
} from './pointerTypes'

const noBoxAtoms = (v: $IntentionalAny) => {
  if (v instanceof modules.box.BoxAtom) {
    return modules.deriveFromBoxAtom.default(v).flatMap(noBoxAtoms)
  } else {
    return v
  }
}

type Address =
  | {
      type: 'WithPath'
      root: $FixMe
      path: Array<MapKey>
    }
  | {
      type: 'fromParentPointer'
      parentPointer: PointerDerivation<$FixMe>
      keyOrIndex: number | string
    }

export class PointerDerivation<V> extends AbstractDerivation<
  DerivationTypeOfPointerType<V>
> {
  v: V
  static NOTFOUND: void = undefined //Symbol('notfound')
  isPointer = true
  _address: Address
  _internalDerivation: undefined | null | AbstractDerivation<$FixMe>
  // inPointer = true
  _props: {[key: string]: PointerDerivation<$FixMe>}

  constructor(address: Address) {
    super()
    // lastPointerId++
    this._address = address
    this._internalDerivation = undefined
    this._props = {}
  }

  prop<K extends MapKey>(key: K): PropOfPointer<V, K> {
    if (!this._props[key]) {
      this._props[key] = new PointerDerivation({
        type: 'fromParentPointer',
        parentPointer: this,
        keyOrIndex: key,
      }) // {...this._address, path: [...this._address.path, key]})
    }
    return this._props[key] as $IntentionalAny
  }

  index(key: number): IndexOfPointer<V> {
    if (!this._props[key]) {
      this._props[key] = new PointerDerivation({
        type: 'fromParentPointer',
        parentPointer: this,
        keyOrIndex: key,
      }) // {...this._address, path: [...this._address.path, key]})
    }
    return this._props[key] as $IntentionalAny
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
    parentPointer: PointerDerivation<$FixMe>,
    keyOrIndex: string | number,
  ) {
    const d = parentPointer
      .flatMap(p => propify(p, keyOrIndex))
      .flatMap(noBoxAtoms)

    // d.inPointer = true
    return d
  }

  _makeDerivationForPath(root: $FixMe, path: Array<string | number>) {
    let finalDerivation = modules.constant.default(root) as AbstractDerivation<
      $FixMe
    >
    // finalDerivation.inPointer = true
    path.forEach(key => {
      finalDerivation = finalDerivation.flatMap(p => propify(p, key))
      // finalDerivation.inPointer = true
    })

    finalDerivation = finalDerivation.flatMap(noBoxAtoms)
    // finalDerivation.inPointer = true
    return finalDerivation
  }

  _getInternalDerivation(): AbstractDerivation<$FixMe> {
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

  pointer(): this {
    return this
  }
}

const _propify = (possibleReactiveValue: $FixMe, key: string | number) => {
  // pointerFlatMaps++
  if (
    possibleReactiveValue === PointerDerivation.NOTFOUND ||
    possibleReactiveValue === undefined
  ) {
    return PointerDerivation.NOTFOUND
  } else if (possibleReactiveValue instanceof modules.dict.DictAtom) {
    return modules.deriveFromPropOfADictAtom.default(
      possibleReactiveValue,
      key as $FixMe,
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
    possibleReactiveValue instanceof modules.DerivedInstance.default ||
    possibleReactiveValue instanceof PointerDerivation ||
    possibleReactiveValue instanceof modules.AbstractDerivedDict.default
  ) {
    return possibleReactiveValue.prop(key)
  } else if (possibleReactiveValue.isDerivedArray === true) {
    return possibleReactiveValue.index(key)
  } else {
    return undefined
  }
}

const propify = (possibleReactiveValue: $FixMe, key: string | number) => {
  const d = _propify(possibleReactiveValue, key)
  if (typeof d === 'object' && d.isDerivation === true) {
    // d.inPointer = true
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
  DerivedInstance: require('$shared/DataVerse/derivedClass/DerivedClassInstance'),
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
