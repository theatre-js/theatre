import {InvalidArgumentError} from './errors'
import {notify} from '@theatre/shared/notify'

/**
 * Make the given string's "path" slashes normalized with preceding and trailing spaces.
 *
 * - It removes starting and trailing slashes: `/foo/bar/` becomes `foo / bar`
 * - It adds wraps each slash with a single space, so that `foo/bar` becomes `foo / bar`
 *
 */
const normalizeSlashedPath = (p: string): string =>
  p
    // remove starting slashes
    .replace(/^[\s\/]*/, '')
    // remove ending slashes
    .replace(/[\s\/]*$/, '')
    // make middle slashes consistent
    .replace(/\s*\/\s*/g, ' / ')

const getValidationErrorsOfSlashedPath = (p: string): void | string => {
  if (typeof p !== 'string') return `it is not a string. (it is a ${typeof p})`

  const components = p.split(/\//)
  if (components.length === 0) return `it is empty.`

  for (let i = 0; i < components.length; i++) {
    const component = components[i].trim()
    if (component.length === 0) return `the component #${i + 1} is empty.`
    if (component.length > 32)
      return `the component '${component}' must have 32 characters or less.`
  }
}

/**
 * Sanitizes a `path` and warns the user if the input doesn't match the sanitized output.
 *
 * See {@link normalizeSlashedPath} for examples of how we do sanitization.
 */
export function validateAndSanitiseSlashedPathOrThrow(
  unsanitisedPath: string,
  fnName: string,
) {
  const sanitisedPath = normalizeSlashedPath(unsanitisedPath)
  if (process.env.NODE_ENV !== 'development') {
    return sanitisedPath
  }
  const validation = getValidationErrorsOfSlashedPath(sanitisedPath)
  if (validation) {
    throw new InvalidArgumentError(
      `The path in ${fnName}(${
        typeof unsanitisedPath === 'string' ? `"${unsanitisedPath}"` : ''
      }) is invalid because ${validation}`,
    )
  }
  if (unsanitisedPath !== sanitisedPath) {
    notify.warning(
      'Invalid path provided to object',
      `The path in \`${fnName}("${unsanitisedPath}")\` was sanitized to \`"${sanitisedPath}"\`.\n\n` +
        'Please replace the path with the sanitized one, otherwise it will likely break in the future.',
      [
        {
          url: 'https://www.theatrejs.com/docs/latest/manual/objects#creating-sheet-objects',
          title: 'Sheet Objects',
        },
        {
          url: 'https://www.theatrejs.com/docs/latest/api/core#sheet.object',
          title: 'API',
        },
      ],
    )
  }
  return sanitisedPath
}
