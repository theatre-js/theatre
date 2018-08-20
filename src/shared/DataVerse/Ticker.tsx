interface ObjectWhoseStructureShouldBeUpdated {
  _updateStructure(): void
}

interface ObjectWhoseComputationShouldBeUpdated {
  _updateComputation(): void
}

export default class Ticker {
  _computationsToUpdate: Set<ObjectWhoseComputationShouldBeUpdated>
  _objectsWhoseStructureShouldBeUpdated: Set<
    ObjectWhoseStructureShouldBeUpdated
  >
  _traces: $FixMe
  _sideEffectsToCall: Set<() => void>

  constructor() {
    this._computationsToUpdate = new Set()
    this._objectsWhoseStructureShouldBeUpdated = new Set()
    if ($env.KEEPING_DERIVATION_TRACES === true) {
      this._traces = new WeakMap()
    }
    this._sideEffectsToCall = new Set()
  }

  registerComputationUpdate(d: ObjectWhoseComputationShouldBeUpdated): void {
    if (this._computationsToUpdate.has(d)) {
      // @todo
      // console.error('Computation is already registered. This should never happen')
      return
    }

    if ($env.KEEPING_DERIVATION_TRACES === true) {
      this._traces.set(d, new Error('Trace'))
    }
    this._computationsToUpdate.add(d)
  }

  addObjectWhoseStructureShouldBeUpdated(
    d: ObjectWhoseStructureShouldBeUpdated,
  ) {
    this._objectsWhoseStructureShouldBeUpdated.add(d)
  }

  registerSideEffect(fn: () => void) {
    this._sideEffectsToCall.add(fn)
  }

  tick() {
    return this._tick(0)
  }

  _tick(n: number): void {
    if (n > 10) {
      console.warn('tick() recursing for 10 times')
    }

    if (n > 100) {
      throw new Error(`Maximum recursion limit for tick()`)
    }

    const oldS = this._objectsWhoseStructureShouldBeUpdated
    this._objectsWhoseStructureShouldBeUpdated = new Set()

    oldS.forEach(d => {
      d._updateStructure()
    })

    if (this._objectsWhoseStructureShouldBeUpdated.size > 0) {
      return this._tick(n + 1)
    }

    const oldD = this._computationsToUpdate
    this._computationsToUpdate = new Set()
    oldD.forEach(d => {
      if ($env.KEEPING_DERIVATION_TRACES === true) {
        // This const is just there for debugging purposes
        // eslint-disable-next-line no-unused-vars
        // const trace = this._traces.get(d)
        this._traces.delete(d)
      }
      d._updateComputation()
    })

    const oldSE = this._sideEffectsToCall
    this._sideEffectsToCall = new Set()
    oldSE.forEach(fn => {
      fn()
    })

    if (
      this._objectsWhoseStructureShouldBeUpdated.size > 0 ||
      this._computationsToUpdate.size > 0 ||
      this._sideEffectsToCall.size > 0
    ) {
      return this._tick(n + 1)
    }
  }
}
