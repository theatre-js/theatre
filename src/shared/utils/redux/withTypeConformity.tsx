import {GenericAction, ReduxReducer} from '$shared/types'
import {diff as diffValues} from 'jiff'
import {betterErrorReporter} from '$shared/ioTypes/betterErrorReporter'
import {identity} from '$shared/utils'

/**
 * A higher-order reducer that ensures the state always conforms to `runtimeType`
 * @param runtimeType an ioTypes type the state should conform to
 * @param getRelevantState In case only part of the state is relevant
 */
const withTypeConformity = <State extends {}>(
  runtimeType: $FixMe,
  getRelevantState: (state: State) => $IntentionalAny = identity,
) => (innerReducer: ReduxReducer<State>): ReduxReducer<State> => (
  oldState: State,
  action: GenericAction,
): State => {
  const newState = innerReducer(oldState, action)

  const validationResult = runtimeType.validate(newState)
  if (validationResult.isLeft()) {
    console.group(`Store state has become invalid.`)
    console.log('State:', newState)
    console.log('Culprit action:', action)
    console.log(
      'Diff:',
      diffValues(getRelevantState(oldState), getRelevantState(newState), {
        invertible: false,
      }),
    )
    const errors = betterErrorReporter(validationResult)
    console.log('Errors:', `(${errors.length})`)
    errors.forEach(err => console.log(err))
    console.groupEnd()
  }

  return newState
}

export default withTypeConformity
