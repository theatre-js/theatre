const constructMapDescriptor = (m: $FixMe, d: $FixMe) => {
  return (
    m &&
    m.mapValues(v => {
      return constructValue.default(v, d)
    })
  )
}

const constructValue = require('./constructValue')

export default constructMapDescriptor
