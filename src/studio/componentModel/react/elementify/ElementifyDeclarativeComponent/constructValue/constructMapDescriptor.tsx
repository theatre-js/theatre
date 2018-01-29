// @flow
// import * as D from '$shared/DataVerse'

const constructMapDescriptor = (desP: $FixMe, d: $FixMe) => {
  if (desP.isPointer !== true) throw Error('Pointers only')

  return desP.flatMap(m => {
    return m && m.mapValues(v => {
      return constructValue.default(v, d)
    })
  })
}

const constructValue = require('./index')

export default constructMapDescriptor
