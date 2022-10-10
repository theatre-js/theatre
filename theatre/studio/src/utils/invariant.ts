import {devStringify} from './devStringify'

type AllowedMessageTypes = string | number | object

/**
 * invariants are like `expect` from jest or another testing library but
 * for use in implementations and not just tests. If the `condition` passed
 * to `invariant` is falsy then `message`, and optionally `found`, are thrown as a
 * {@link InvariantError} which has a developer-readable and command line friendly
 * stack trace and error message.
 */
export function invariant(
  shouldBeTruthy: any,
  message: (() => AllowedMessageTypes) | AllowedMessageTypes,
  butFoundInstead?: any,
): asserts shouldBeTruthy {
  if (!shouldBeTruthy) {
    const isFoundArgGiven = arguments.length > 2
    if (isFoundArgGiven) {
      invariantThrow(message, butFoundInstead)
    } else {
      invariantThrow(message)
    }
  }
}

/**
 * Throws an error message with a developer-readable and command line friendly
 * string of the argument `butFoundInstead`.
 *
 * Also see {@link invariant}, which accepts a condition.
 */
export function invariantThrow(
  message: (() => AllowedMessageTypes) | AllowedMessageTypes,
  butFoundInstead?: any,
): never {
  const isFoundArgGiven = arguments.length > 1
  const prefix = devStringify(
    typeof message === 'function' ? message() : message,
  )
  const suffix = isFoundArgGiven
    ? `\nInstead found: ${devStringify(butFoundInstead)}`
    : ''
  throw new InvariantError(`Invariant: ${prefix}${suffix}`, butFoundInstead)
}

/**
 * Enable exhaustive checking
 *
 * @example
 * ```ts
 * function a(x: 'a' | 'b') {
 *   if (x === 'a') {
 *
 *   } else if (x === 'b') {
 *
 *   } else {
 *     invariantUnreachable(x)
 *   }
 * }
 * ```
 */
export function invariantUnreachable(x: never): never {
  invariantThrow(
    'invariantUnreachable encountered value which was supposed to be never',
    x,
  )
}

// regexes to remove lines from thrown error stacktraces
const AT_NODE_INTERNAL_RE = /^\s*at.+node:internal.+/gm
const AT_INVARIANT_RE = /^\s*(at|[^@]+@) (?:Object\.)?invariant.+/gm
const AT_TEST_HELPERS_RE = /^\s*(at|[^@]+@).+test\-helpers.+/gm
// const AT_WEB_MODULES = /^\s*(at|[^@]+@).+(web_modules|\-[a-f0-9]{8}\.js).*/gm
const AT_ASSORTED_HELPERS_RE =
  /^\s*(at|[^@]+@).+(debounce|invariant|iif)\.[tj]s.*/gm

/**
 * `InvariantError` removes lines from the `Error.stack` stack trace string
 * which cleans up the stack trace, making it more developer friendly to read.
 */
class InvariantError extends Error {
  found: any
  constructor(message: string, found?: any) {
    super(message)
    if (found !== undefined) {
      this.found = found
    }
    // const before = this.stack
    // prettier-ignore
    this.stack = this.stack
      ?.replace(AT_INVARIANT_RE, "")
      .replace(AT_ASSORTED_HELPERS_RE, "")
      .replace(AT_TEST_HELPERS_RE, "")
      .replace(AT_NODE_INTERNAL_RE, "")
    // console.error({ before, after: this.stack })
  }
}
