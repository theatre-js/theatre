// @flow
import isAtom from '$shared/DataVerse/atoms/utils/isAtom'

const toJS = (val: $IntentionalAny) => {
  if (typeof val === 'object') {
    if (!val) {
      return val
    } else {
      return isAtom(val)
        ? val.unboxDeep()
        : val.isDerivedArray === true
          ? val.toJS()
          : val.isDerivedDict === true ? val.toJS() : val
    }
  } else {
    return val
  }
}

export default toJS
