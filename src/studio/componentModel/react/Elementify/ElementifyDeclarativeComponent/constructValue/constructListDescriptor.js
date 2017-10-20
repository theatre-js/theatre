// @flow
// import * as D from '$shared/DataVerse'

const constructListDescriptor = (des: $FixMe, d: $FixMe) => {
  return des.map((v) => constructValue.default(v, d))
}

const constructValue = require('./index')

export default constructListDescriptor