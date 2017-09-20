// @flow
import Derivation from '$shared/DataVerse/derivations/Derivation'

export default class Context {
  _derivationsToUpdate: *

  constructor() {
    this._derivationsToUpdate = new Set()
  }

  addDerivationToUpdate(d: Derivation) {
    this._derivationsToUpdate.add(d)
  }

  tick() {
    this._derivationsToUpdate.forEach((d) => {
      d._tick()
    })

    this._derivationsToUpdate.clear()
  }
}