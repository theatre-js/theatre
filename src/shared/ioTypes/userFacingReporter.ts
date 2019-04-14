import * as array from 'fp-ts/lib/Array'
import * as t from '$shared/ioTypes'

const formatValidationError = (error: t.ValidationError) => {
  const path = error.context
    .map(c => {
      return c.key
    })
    .filter(key => key.length > 0)
    .map(key =>
      key.match(/^[a-zA-Z\_]+\w*$/) ? key : `[${JSON.stringify(key)}]`,
    )
    .join('.')

  // The actual error is last in context
  const maybeErrorContext = array.last(
    error.context as t.ValidationContextEntry[],
  )

  return maybeErrorContext.map((errorContext: t.ValidationContextEntry) => {
    const expectedType = errorContext.type.name
    let jsonValue =
      typeof error.value === 'undefined'
        ? 'undefined'
        : JSON.stringify(error.value)
    if (jsonValue.length > 20) {
      jsonValue = jsonValue.substr(0, 20) + ' ...'
    }
    const message = `Unexpected value in \`${path}\`. Expected type: ${expectedType}. Received: ${jsonValue} ${
      typeof error.extraInfo === 'string' ? error.extraInfo : ''
    }`
    return message
  })
}

export const userFacingReoprter = (validation: t.Validation) =>
  validation.fold(
    errors => array.catOptions(errors.map(formatValidationError)),
    () => [],
  )
