import ellipsify from './ellipsify'

/**
 * Returns a short, user-readable description of the type of `value`.
 * Examples:
 * ```ts
 * userReadableTypeOfValue(1) // 'number(1)'
 * userReadableTypeOfValue(12345678901112) // 'number(1234567...)'
 * userReadableTypeOfValue('hello') // 'string("hello")'
 * userReadableTypeOfValue('hello world this is a long string') // 'string("hello wo...")'
 * userReadableTypeOfValue({a: 1, b: 2}) // 'object'
 * userReadableTypeOfValue([1, 2, 3]) // 'array'
 * userReadableTypeOfValue(null) // 'null'
 * userReadableTypeOfValue(undefined) // 'undefined'
 * userReadableTypeOfValue(true) // 'true'
 * ```
 */
const userReadableTypeOfValue = (v: unknown): string => {
  if (typeof v === 'string') {
    return `string("${ellipsify(v, 10)}")`
  } else if (typeof v === 'number') {
    return `number(${ellipsify(String(v), 10)})`
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
