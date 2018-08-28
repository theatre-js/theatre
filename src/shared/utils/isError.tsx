export const isError = (a: mixed): a is {errorType: string} => {
  // @ts-ignore @ignore
  return a && a.errorType && typeof a.errorType === 'string'
}
