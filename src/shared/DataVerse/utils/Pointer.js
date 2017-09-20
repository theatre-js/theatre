// @flow
import type {Address} from '$shared/DataVerse/types'
import * as D from '$shared/DataVerse'

export default class Pointer {
  static NOTFOUND = Symbol('notfound')
  _address: Address
  _derivation: ?*
  constructor(address: Address) {
    this._address = address
    this._derivation = null
  }

  prop(key: string | number) {
    return new Pointer({...this._address, path: [...this._address.path, key]})
  }

  index(key: number) {
    return new Pointer({...this._address, path: [...this._address.path, key]})
  }

  _makeDerivation() {
    let finalDerivation = new SimpleDerivation.default({}, () => this._address.root)
    this._address.path.forEach((key) => {
      finalDerivation = finalDerivation.flatMap((possibleCompositeAtom) => {
        if (possibleCompositeAtom === Pointer.NOTFOUND || possibleCompositeAtom === undefined) {
          return Pointer.NOTFOUND
        } else if (possibleCompositeAtom instanceof D.MapAtom) {
          return new DerivationOfAPropOfAMapAtom.default(possibleCompositeAtom, key)
        } else if (possibleCompositeAtom instanceof D.ArrayAtom) {
          return new DerivationOfAnIndexOfAnArrayAtom.default(possibleCompositeAtom, key)
        } else {
          return possibleCompositeAtom
        }
      })
    })

    finalDerivation = finalDerivation.flatMap((possibleBoxAtom) => possibleBoxAtom instanceof D.BoxAtom ? new DerivationOfABoxAtom.default(possibleBoxAtom) : Pointer.NOTFOUND)

    return finalDerivation
  }

  derivation() {
    if (!this._derivation) {
      this._derivation = this._makeDerivation()
    }

    return this._derivation
  }
}

const SimpleDerivation = require('$shared/DataVerse/derivations/SimpleDerivation')
const DerivationOfAPropOfAMapAtom = require('$shared/DataVerse/derivations/DerivationOfAPropOfAMapAtom')
const DerivationOfAnIndexOfAnArrayAtom = require('$shared/DataVerse/derivations/DerivationOfAnIndexOfAnArrayAtom')
const DerivationOfABoxAtom = require('$shared/DataVerse/derivations/DerivationOfABoxAtom')