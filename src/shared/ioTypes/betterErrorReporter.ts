import * as array from 'fp-ts/lib/Array'
import * as t from '$shared/ioTypes'

// const jsToString = (value: t.mixed) =>
//   value === undefined ? 'undefined' : JSON.stringify(value)

// function stringify(v: any): string {
//   return typeof v === 'function' ? t.getFunctionName(v) : JSON.stringify(v)
// }

// function getContextPath(context: t.Context): string {
//   return context.map(({key, type}) => `${key}: ${type.name}`).join('.')
// }

const formatValidationError = (error: t.ValidationError) => {
  // const path = getContextPath(error.context)

  const path = error.context
    .map(c => c.key)
    // The context entry with an empty key is the original type ("default
    // context"), not an type error.
    .filter(key => key.length > 0)
    .join('.')

  // The actual error is last in context
  const maybeErrorContext = array.last(error.context as t.ValidationContextEntry[])

  return maybeErrorContext.map((errorContext: t.ValidationContextEntry) => {
    const expectedType = errorContext.type.name
    return {path, expectedType, value: error.value}
    // `Expecting ${expectedType}` +
    // (path === '' ? '' : ` at ${path}`) +
    // ` but instead got: ${stringify(error.value)}.`
  })
}

export const betterErrorReporter = (validation: t.Validation) =>
  validation.fold(
    errors => array.catOptions(errors.map(formatValidationError)),
    () => [],
  )
