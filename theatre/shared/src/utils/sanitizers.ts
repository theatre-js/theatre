import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'

const _validateName = (name: string, thingy: string): void | string => {
  if (typeof name !== 'string') {
    return `${thingy} must be a string. ${userReadableTypeOfValue(name)} given.`
  } else if (name.trim().length !== name.length) {
    return `${thingy} must not have leading or trailing spaces. '${name}' given.`
  } else if (name.length < 3 || name.length > 32) {
    return `${thingy} must have between 3 and 32 characters. '${name}' given.`
  }
}

export const validateName = (
  name: string,
  thingy: string,
  shouldThrow: boolean = false,
) => {
  const result = _validateName(name, thingy)
  if (typeof result === 'string' && shouldThrow) {
    throw new InvalidArgumentError(result)
  } else {
    return result
  }
}
