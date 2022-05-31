import {stringify} from './stringify'

type accepts = string | number | object
export function invariant(
  cond: any,
  /** Pass a message or function producing a message */
  message: (() => accepts) | accepts | undefined,
  /** Pass a value for what we found instead */
  found?: any,
): asserts cond {
  if (!cond) {
    throw new InvariantError(
      'Invariant: ' +
        stringify(typeof message === 'function' ? message() : message) +
        (arguments.length > 2 ? `\nInstead found: ${stringify(found)}` : ''),
      found,
    )
  }
}

/** Plain old throw with a never return to help the type system */
export function invariantThrow(
  /** Pass a message or function producing a message */
  message: (() => accepts) | accepts,
  /** Pass a value for what we found instead */
  found?: any,
): never {
  throw new InvariantError(
    'Invariant: ' +
      stringify(typeof message === 'function' ? message() : message) +
      (arguments.length > 1
        ? `\nInstead found: ${
            // check if probably already contains stringified json
            /": "/.test(found) ? found : stringify(found)
          }`
        : ''),
    found,
  )
}

export function invariantUnreachable(x: never): never {
  invariantThrow(
    'invariantUnreachable encountered value which was supposed to be never',
    x,
  )
}

// remove these lines from thrown errors
const AT_NODE_INTERNAL_RE = /^\s*at.+node:internal.+/gm
const AT_INVARIANT_RE = /^\s*(at|[^@]+@) (?:Object\.)?invariant.+/gm
const AT_TEST_HELPERS_RE = /^\s*(at|[^@]+@).+test\-helpers.+/gm
// const AT_WEB_MODULES = /^\s*(at|[^@]+@).+(web_modules|\-[a-f0-9]{8}\.js).*/gm
const AT_ASSORTED_HELPERS_RE =
  /^\s*(at|[^@]+@).+(debounce|invariant|iif)\.[tj]s.*/gm

/** `InvariantError` removes the invariant line from the `Error.stack` */
class InvariantError extends Error {
  found: any
  constructor(message: string, found?: any) {
    super(message)
    if (found) {
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
