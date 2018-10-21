import ellipsify from './ellipsify'

const userReadableTypeOfValue = (v: mixed): string => {
  if (typeof v === 'string') {
    return `string("${ellipsify(v, 10)}")`
  } else if (typeof v === 'number') {
    return `string("${ellipsify(String(v), 10)}")`
  } else if (v === null) {
    return 'null'
  } else if (v === undefined) {
    return 'undefined'
  } else if (typeof v === 'boolean') {
    return String(v)
  } else if (Array.isArray(v)) {
    return 'array'
  } else if (typeof v === 'object') {
    return 'object'
  } else {
    return 'unknown'
  }
}

export default userReadableTypeOfValue
