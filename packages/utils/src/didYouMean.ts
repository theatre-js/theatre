import propose from 'propose'

/**
 * Proposes a suggestion to fix a typo in `str`, using the options provided in `dictionary`.
 *
 * Example:
 * ```ts
 * didYouMean('helo', ['hello', 'world']) // 'Did you mean "hello"?'
 * ```
 */
export default function didYouMean(
  str: string,
  dictionary: string[],
  prepend: string = 'Did you mean ',
  append: string = '?',
): string {
  const p = propose(str, dictionary, {
    threshold: 0.7,
  })

  if (p) {
    return prepend + JSON.stringify(p) + append
  } else {
    return ''
  }
}
