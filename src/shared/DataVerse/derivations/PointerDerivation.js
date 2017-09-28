// @flow
import type {Address, MapKey} from '$shared/DataVerse/types'
import Derivation from './Derivation'
import * as D from '$shared/DataVerse'

export default class PointerDerivation extends Derivation<$FixMe> {
  static NOTFOUND = undefined //Symbol('notfound')
  _address: Address
  _internalDerivation: ?Derivation<$FixMe>

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

  _getInternalDerivation(): Derivation<$FixMe> {
    if (!this._internalDerivation) {
      this._internalDerivation = this._makeDerivation()
    }
    return this._internalDerivation
  }

  _makeDerivation() {
    let finalDerivation = new SimpleDerivation.default({}, () => this._address.root)
    this._address.path.forEach((key) => {
      finalDerivation = finalDerivation.flatMap((possibleReactiveValue) => {
        if (possibleReactiveValue === PointerDerivation.NOTFOUND || possibleReactiveValue === undefined) {
          return PointerDerivation.NOTFOUND
        } else if (possibleReactiveValue instanceof D.MapAtom) {
          return new DerivationOfAPropOfAMapAtom.default(possibleReactiveValue, (key: $FixMe))
        } else if (possibleReactiveValue instanceof D.ArrayAtom && typeof key === 'number') {
          return new DerivationOfAnIndexOfAnArrayAtom.default(possibleReactiveValue, key)
        } else if (possibleReactiveValue instanceof DerivedMapFace.default || possibleReactiveValue instanceof PointerDerivation) {
          return possibleReactiveValue.prop(key)
        } else {
          return undefined
        }
      })
    })

    const flattenFinalDerivation = (finalThing) => {
      if (finalThing instanceof D.BoxAtom) {
        return new DerivationOfABoxAtom.default(finalThing)
      } else {
        return finalThing
      }
    }

    finalDerivation = finalDerivation.flatMap(flattenFinalDerivation).flatten()

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

const SimpleDerivation = require('./SimpleDerivation')
// const ConstantDerivation = require('./ConstantDerivation')
const DerivationOfAPropOfAMapAtom = require('./DerivationOfAPropOfAMapAtom')
const DerivationOfAnIndexOfAnArrayAtom = require('./DerivationOfAnIndexOfAnArrayAtom')
// const DerivationOfAPropOfADerivedMapFace = require('./DerivationOfAPropOfADerivedMapFace')
const DerivationOfABoxAtom = require('./DerivationOfABoxAtom')
const DerivedMapFace = require('./DerivedMapFace')