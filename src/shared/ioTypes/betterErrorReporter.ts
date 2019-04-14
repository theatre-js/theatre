import * as array from 'fp-ts/lib/Array'
import * as t from '$shared/ioTypes'

const formatValidationError = (error: t.ValidationError) => {
  const path = error.context
    .map(c => {
      return {key: c.key, value: c.value}
    })
    .filter(({key}) => key.length > 0)

  // The actual error is last in context
  const maybeErrorContext = array.last(
    error.context as t.ValidationContextEntry[],
  )

  return maybeErrorContext.map((errorContext: t.ValidationContextEntry) => {
    const expectedType = errorContext.type.name
    return {
      path,
      expectedType,
      value: error.value,
      ...(error.extraInfo ? {info: error.extraInfo} : {}),
    }
  })
}

export const betterErrorReporter = (validation: t.Validation) =>
  validation.fold(
    errors => array.catOptions(errors.map(formatValidationError)),
    () => [],
  )
