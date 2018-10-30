const constructListDescriptor = (derivedArray: $FixMe, self: $FixMe) => {
  return derivedArray && derivedArray.map(v => constructValue.default(v, self))
}

const constructValue = require('./constructValue')

export default constructListDescriptor
