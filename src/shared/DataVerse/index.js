// @flow
import Reference from './references/Reference'
import MapOfReferences from './references/MapOfReferences'
import ArrayOfReferences from './references/ArrayOfReferences'
import referencifyDeep from './references/referencifyDeep'
import DerivationContext from './derivations/DerivationContext'

interface CompositeWire {
  get(key: $FixMe): $FixMe,
  pointerTo(path: Array<mixed>): $FixMe,
}

interface MapWire extends CompositeWire {
}

interface INonIterableMapWire extends MapWire {

}

class NonIterableMapWire implements INonIterableMapWire {
  _lookupTable: *
  _superMapWire: ?MapWire

  constructor(lookupTable: $FixMe, superWire?: MapWire) {
    this._lookupTable = lookupTable
    this._superMapWire = superWire
  }

  get(key: $FixMe): $FixMe {
    // const
  }

  extend(lookupTable: $FixMe): INonIterableMapWire {
    return new NonIterableMapWire(lookupTable, this)
  }

  pointerTo(path: Array<mixed>): $FixMe {

  }
}

interface IIterableArrayWire {

}

class IterableArrayWire implements IIterableArrayWire {
  constructor(l: $FixMe) {

  }
}

interface IDerivativeBoxWire<Input: {}> {

}

class DerivativeBoxWire<Input: {}> implements IDerivativeBoxWire<Input> {
  constructor(input: Input, fn: (input: $FixMe) => {}) {

  }
}

class IterableMapWire {
  constructor(initial: {}) {

  }
}

export {
  Reference,
  MapOfReferences,
  referencifyDeep,
  ArrayOfReferences,
  DerivationContext,
  NonIterableMapWire,
  IterableArrayWire,
  DerivativeBoxWire,
  IterableMapWire,
}