const constructMapDescriptor = (m: $FixMe, self: $FixMe) => {
  return (
    m &&
    m.mapValues(v => {
      return constructValue.default(v, self)
    })
  )
}

const constructValue = require('./constructValue')

export default constructMapDescriptor
