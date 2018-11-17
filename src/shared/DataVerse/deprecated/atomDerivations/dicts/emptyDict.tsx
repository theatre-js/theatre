import AbstractDerivedDict from './AbstractDerivedDict'
import constant from '$shared/DataVerse/derivations/constant'

const emptyArray: Array<never> = []

export class EmptyDict extends AbstractDerivedDict<{}> {
  constructor() {
    super()
    return this
  }

  // @ts-ignore @ignore
  prop(_k) {
    return constant(undefined) as $IntentionalAny
  }

  _reactToHavingTappers() {}

  _reactToNotHavingTappers() {}

  keys() {
    return emptyArray
  }
}

const emptyDict = new EmptyDict()

export default emptyDict
