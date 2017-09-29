// @flow
import type {IDerivation} from '$shared/DataVerse/derivations/types'

interface ObjectWhoseStructureShouldBeUpdated {
  _updateStructure: () => void,
}

export default class Context {
  _derivationsToUpdate: *
  _objectsWhoseStructureShouldBeUpdated: *

  constructor() {
    this._derivationsToUpdate = new Set()
    this._objectsWhoseStructureShouldBeUpdated = new Set()
  }

  addDerivationToUpdate(d: IDerivation<$IntentionalAny>) {
    this._derivationsToUpdate.add(d)
  }

  addObjectWhoseStructureShouldBeUpdated(d: ObjectWhoseStructureShouldBeUpdated) {
    this._objectsWhoseStructureShouldBeUpdated.add(d)
  }

  tick() {
    this._objectsWhoseStructureShouldBeUpdated.forEach((d) => {
      d._updateStructure()
    })

    this._objectsWhoseStructureShouldBeUpdated.clear()

    this._derivationsToUpdate.forEach((d) => {
      d._tick()
    })

    this._derivationsToUpdate.clear()
  }
}