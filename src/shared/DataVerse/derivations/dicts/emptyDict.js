// @flow
import type {IDerivedDict} from './types'
import DerivedDict from './AbstractDerivedDict'
import constantDerivation from '../constant'

const emptyArray = []

export class EmptyDict extends DerivedDict implements IDerivedDict<$FixMe> {
  prop: $FixMe
  changes: $FixMe

  constructor(): IDerivedDict<$FixMe> {
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