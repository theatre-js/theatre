import {betterErrorReporter} from '$shared/ioTypes/betterErrorReporter'
import immer from 'immer'
import * as t from '$shared/ioTypes'
import {diff as diffValues} from 'jiff'

type OuterReducer<State, Payload> = (
  prevState: State,
  action: {type: string; payload: Payload},
) => State

type InnerReducer<State, Payload> = (prevState: State, payload: Payload) => void

/**
 * Wraps a reducer with immer(), and adds ioTypes validation to its
 * returned state
 */
const reducto = <State>(stateIoType: t.Type<State>) => <Payload>(
  innerReducer: InnerReducer<State, Payload>,
): OuterReducer<State, Payload> => {
  const outerReducer: OuterReducer<State, Payload> = (prevState, action) => {
    const newState = immer(prevState, draftState => {
      innerReducer(draftState, action.payload)
    })

    if (process.env.NODE_ENV === 'development') {
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
        errors.forEach(err => console.log(err))
        console.groupEnd()
      }
    }

    return newState
  }

  return outerReducer
}

export default reducto
