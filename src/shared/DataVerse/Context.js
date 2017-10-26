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
    return this._tick(0)
  }

  _tick(n: number) {
    if (n > 10) {
      console.warn('tick() recursing for 10 times')
    }

    if (n > 100) {
      throw new Error(`Maximum recursion limit for tick()`)
    }

    const oldS = this._objectsWhoseStructureShouldBeUpdated
    this._objectsWhoseStructureShouldBeUpdated = new Set()

    oldS.forEach((d) => {
      d._updateStructure()
    })

    if (this._objectsWhoseStructureShouldBeUpdated.size > 0) {
      return this._tick(n + 1)
    }

    const oldD = this._derivationsToUpdate
    this._derivationsToUpdate = new Set()
    oldD.forEach((d) => {
      d._tick()
    })

    if (this._objectsWhoseStructureShouldBeUpdated.size > 0 || this._derivationsToUpdate.size > 0) {
      return this._tick(n + 1)
    }
  }
}