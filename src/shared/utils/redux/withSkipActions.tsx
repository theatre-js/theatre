import {ReduxReducer, GenericAction} from '$shared/types'

/**
 * Just a higher-order reducer that skips some actions
 *
 * @param innerReducer The inner reducer
 * @param shouldSkip A function like (GenericAction) => boolean
 */
export const withSkipActions = <State extends {}>(
  innerReducer: ReduxReducer<State>,
  shouldSkip: (action: GenericAction) => boolean,
): ReduxReducer<State> => {
  const newReducer = (
    state: undefined | State,
    action: GenericAction,
  ): State => {
    return shouldSkip(action) ? (state as State) : innerReducer(state, action)
  }

  return newReducer
}
