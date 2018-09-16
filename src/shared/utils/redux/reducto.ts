import immer from 'immer'
import * as t from '$shared/ioTypes'

type OuterReducer<State, Payload> = {
  (prevState: State, action: {type: string; payload: Payload}): State
  originalReducer: InnerReducer<State, Payload>
}

type InnerReducer<State, Payload> = (prevState: State, payload: Payload) => void | State

/**
 * Wraps a reducer with immer(), and adds ioTypes validation to its
 * returned state
 */
const reducto = <State>(stateIoType: t.Type<State>) => <Payload>(
  innerReducer: InnerReducer<State, Payload>,
): OuterReducer<State, Payload> => {
  // @ts-ignore @ignore
  const outerReducer: OuterReducer<State, Payload> = (prevState, action) => {
    const newState = immer(prevState, draftState => {
      return innerReducer(draftState as $IntentionalAny, action.payload)
    })

    if ($env.NODE_ENV === 'development' && stateIoType) {
      const {
        betterErrorReporter,
      } = require('$shared/ioTypes/betterErrorReporter')
      const {diff: diffValues} = require('jiff')
      const validationResult = stateIoType.validate(newState as $FixMe)
      if (validationResult.isLeft()) {
        console.group(
          `Reducer ${innerReducer.name} has returned an invalid value.`,
        )
        console.log('State:', newState)
        console.log('Culprit action:', action)
        console.log(
          'Diff:',
          diffValues(prevState, newState, {
            invertible: false,
          }),
        )
        const errors = betterErrorReporter(validationResult)
        console.log('Errors:', `(${errors.length})`)
        errors.forEach((err: $IntentionalAny) => console.log(err))
        console.groupEnd()
      }
    }

    return newState
  }

  outerReducer.originalReducer = innerReducer

  return outerReducer
}

export default reducto
