export const isSafari =
  typeof window !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
