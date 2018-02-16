import AbstractDerivedDict from './AbstractDerivedDict'
import constantDerivation from '../constant'

const emptyArray: Array<never> = []

export class EmptyDict extends AbstractDerivedDict<{}> {
  constructor() {
    super()
    return this
  }

  prop(_k: void) {
    return constantDerivation(undefined) as $IntentionalAny
  }

  _reactToHavingTappers() {}

  _reactToNotHavingTappers() {}

  keys() {
    return emptyArray
  }
}

const emptyDict = new EmptyDict

export default emptyDict
