// @flow
import type {Address, MapKey} from '$shared/DataVerse/types'
import Derivation from './Derivation'
import * as D from '$shared/DataVerse'
import type {IDerivation} from './types'

export interface IPointer<V> extends IDerivation<V> {
  prop(key: MapKey): IPointer<$FixMe>,
  index(key: number): IPointer<$FixMe>,
  pointer(): IPointer<V>,
}

const noBoxAtoms = (v) => {
  if (v instanceof D.BoxAtom) {
    return deriveFromBoxAtom.default(v).flatMap(noBoxAtoms)
  } else {
    return v
  }
}

export class PointerDerivation extends Derivation implements IPointer<$FixMe> {
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
    let finalDerivation = withDeps.default({}, () => this._address.root)
    this._address.path.forEach((key) => {
      finalDerivation = finalDerivation.flatMap((possibleReactiveValue) => {
        if (possibleReactiveValue === PointerDerivation.NOTFOUND || possibleReactiveValue === undefined) {
          return PointerDerivation.NOTFOUND
        } else if (possibleReactiveValue instanceof D.MapAtom) {
          return deriveFromPropOfAMapAtom.default(possibleReactiveValue, (key: $FixMe))
        } else if (possibleReactiveValue instanceof D.ArrayAtom && typeof key === 'number') {
          return deriveFromIndexOfArrayAtom.default(possibleReactiveValue, key)
        } else if (possibleReactiveValue instanceof WiryMapFace.default || possibleReactiveValue instanceof PointerDerivation) {
          return possibleReactiveValue.prop(key)
        } else {
          return undefined
        }
      }).flatMap(noBoxAtoms)
    })

    finalDerivation._addDependent(this)

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

const withDeps = require('./withDeps')
// const ConstantDerivation = require('./ConstantDerivation')
const deriveFromPropOfAMapAtom = require('./ofAtoms/deriveFromPropOfAMapAtom')
const deriveFromIndexOfArrayAtom = require('./ofAtoms/deriveFromIndexOfArrayAtom')
// const DerivationOfAPropOfAWiryMapFace = require('./DerivationOfAPropOfAWiryMapFace')
const deriveFromBoxAtom = require('./ofAtoms/deriveFromBoxAtom')
const WiryMapFace = require('./composites/WiryMapFace')