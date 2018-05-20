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
  const path = error.context
    .map((c) => {
      return {key: c.key, value: c.value}
    })
    .filter(({key}) => key.length > 0)

  // The actual error is last in context
  const maybeErrorContext = array.last(error.context as t.ValidationContextEntry[])

  return maybeErrorContext.map((errorContext: t.ValidationContextEntry) => {
    const expectedType = errorContext.type.name
    return {path, expectedType, value: error.value, ...(error.extraInfo ? {info: error.extraInfo} : {})}
  })
}

export const betterErrorReporter = (validation: t.Validation) =>
  validation.fold(
    errors => array.catOptions(errors.map(formatValidationError)),
    () => [],
  )
