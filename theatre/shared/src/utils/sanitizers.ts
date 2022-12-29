import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'

const _validateSym = (
  val: string,
  thingy: string, // there are two unsolved problems in computer science: cache invalidation and naming things.
  range: [min: number, max: number],
): void | string => {
  if (typeof val !== 'string') {
    return `${thingy} must be a string. ${userReadableTypeOfValue(val)} given.`
  } else if (val.trim().length !== val.length) {
    return `${thingy} must not have leading or trailing spaces. '${val}' given.`
  } else if (val.length < range[0] || val.length > range[1]) {
    return `${thingy} must have between ${range[0]} and ${range[1]} characters. '${val}' given.`
  }
}

/**
 * Validates a name, so that:
 * - It's a string
 * - It doesn't have leading or trailing spaces
 * - It's between 3 and 32 characters long
 */
export const validateName = (
  name: string,
  thingy: string,
  shouldThrow: boolean = false,
) => {
  const result = _validateSym(name, thingy, [3, 32])
  if (typeof result === 'string' && shouldThrow) {
    throw new InvalidArgumentError(result)
  } else {
    return result
  }
}

/**
 * Validates an instanceId, so that:
 * - It's a string
 * - It doesn't have leading or trailing spaces
 * - It's between 1 and 32 characters long
 */
export const validateInstanceId = (
  name: string,
  thingy: string,
  shouldThrow: boolean = false,
) => {
  const result = _validateSym(name, thingy, [1, 32])
  if (typeof result === 'string' && shouldThrow) {
    throw new InvalidArgumentError(result)
  } else {
    return result
  }
}
