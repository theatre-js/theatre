const constructListDescriptor = (derivedArray: $FixMe, d: $FixMe) => {
  return derivedArray && derivedArray.map(v => constructValue.default(v, d))
}

const constructValue = require('./constructValue')

export default constructListDescriptor
