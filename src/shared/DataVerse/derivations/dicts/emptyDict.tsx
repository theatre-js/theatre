// @flow
import AbstractDerivedDict from './AbstractDerivedDict'
import constantDerivation from '../constant'

const emptyArray: Array<never> = []

export class EmptyDict extends AbstractDerivedDict<$FixMe> {
  changes: $FixMe

  constructor() {
    super()
    return this
  }

  prop(k: mixed) {
    return constantDerivation(undefined)
  }

  _reactToHavingTappers() {}

  _reactToNotHavingTappers() {}

  keys() {
    return emptyArray
  }
}

export default new EmptyDict()
