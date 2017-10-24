// @flow
import type {IDerivedDict} from './types'
import AbstractDerivedDict from './AbstractDerivedDict'
import constantDerivation from '../constant'

const emptyArray = []

export class EmptyDict extends AbstractDerivedDict implements IDerivedDict<$FixMe> {
  prop: $FixMe
  changes: $FixMe

  constructor(): IDerivedDict<$FixMe> {
    super()
    return this
  }

  prop(k: mixed) { // eslint-disable-line no-unused-vars
    return constantDerivation(undefined)
  }

  _reactToHavingTappers() {}

  _reactToNotHavingTappers() {}

  keys() {
    return emptyArray
  }
}

export default new EmptyDict()