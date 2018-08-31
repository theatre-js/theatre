import {ReduxReducer, GenericAction} from '$shared/types'
import actionCreator from '$shared/utils/redux/actionCreator'

export const batchedAction = actionCreator(
  '@@batched',
  (actions: GenericAction[]): GenericAction[] => actions,
)

const withBatchedActions = <S extends {}>(
  reducer: ReduxReducer<S>,
): ReduxReducer<S> => {
  return (prevState: undefined | S, action: GenericAction): S => {
    if (batchedAction.is(action)) {
      // @ts-ignore
      return action.payload.reduce(
        (stateSoFar: undefined | S, a: GenericAction): S =>
          reducer(stateSoFar, a),
        prevState,
      )
    } else {
      return reducer(prevState, action)
    }
  }
}

export default withBatchedActions
