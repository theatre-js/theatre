
import ValueDerivation from './ValueDerivation'

export default class ValueInstance {
  _derivation: *

  constructor(
    descP: $FixMe,
    timeD: $FixMe,
    theater: $FixMe,
    pathToValueDescriptor: Array<string>,
  ) {
    this._derivation = new ValueDerivation(
      descP,
      timeD,
      theater,
      pathToValueDescriptor,
    )
  }

  derivation() {
    return this._derivation
  }
}
