// @flow
import * as D from '$shared/DataVerse'

const constructMapDescriptor = (des: $FixMe, d: $FixMe) => {
  return des.prop('values').flatMap((m) => {
    return D.derivations.mapValues(m, (v, k) => {
      return constructValue.default(v, d)
    })
  })
}

const constructValue = require('./index')

export default constructMapDescriptor