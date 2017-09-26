// @flow
import Derivation from './Derivation'

export default class DummyDerivation extends Derivation<null> {
  constructor() {
    super()
  }

  _recalculate() {
    return null
  }
}