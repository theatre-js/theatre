import propose from 'propose'

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
