
import ValueDerivation from './ValueDerivation'

export default class ValueInstance {
  _derivation: *

  constructor(
    descP: $FixMe,
    timeD: $FixMe,
    studio: $FixMe,
    pathToValueDescriptor: Array<string>,
  ) {
    this._derivation = new ValueDerivation(
      descP,
      timeD,
      studio,
      pathToValueDescriptor,
    )
  }

  derivation() {
    return this._derivation
  }
}
