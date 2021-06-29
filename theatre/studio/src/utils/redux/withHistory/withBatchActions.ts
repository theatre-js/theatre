import actionCreator from '@theatre/studio/utils/redux/actionCreator'
import type {
  $FixMe,
  GenericAction,
  ReduxReducer,
} from '@theatre/shared/utils/types'

export const batchedAction = actionCreator(
  '@@batched',
  (actions: GenericAction[]): GenericAction[] => actions,
)

const withBatchedActions = <S extends {}>(
  reducer: ReduxReducer<S>,
): ReduxReducer<S> => {
  return (prevState: undefined | S, action: unknown): S => {
    if (batchedAction.is(action)) {
      return (action.payload as $FixMe).reduce(
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
