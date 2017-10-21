// @flow
// import * as D from '$shared/DataVerse'

const constructMapDescriptor = (desP: $FixMe, d: $FixMe) => {
  if (desP.isPointer !== 'True')
    throw Error('Pointers only')

  return desP.prop('values').flatMap((m) => {
    return m.mapValues((v) => {
      return constructValue.default(v, d)
    })
  })
}

const constructValue = require('./index')

export default constructMapDescriptor