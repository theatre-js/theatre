// @flow
import {createAction} from 'redux-actions'

type Reducer<ActionType, Payload> = <State>(
  callback: (state: State, action: {type: ActionType, payload: Payload}) => State,
) => {
  (state: State, action: {type: ActionType, payload: Payload}): State,
  type: ActionType,
}

type ActionCreatorCreator = (<
  ActionType,
  Payload,
  Input,
  Transformer: (input: Input) => Payload,
>(
  actionType: ActionType,
  transformer: Transformer,
) => {
  (input: Input): {type: ActionType, payload: Payload},
  type: ActionType,
  reducer: Reducer<ActionType, Payload>,
}) &
  (<ActionType>(
    actionType: ActionType,
  ) => {
    <Payload>(payload: Payload): {type: ActionType, payload: Payload},
    type: ActionType,
    reducer: Reducer<ActionType, any>,
  })

/**
 * This is basically the same as {createAction} from 'redux-actions',
 * only that you can query the type of the action from the resulting
 * action creator.
 */
const actionCreator: ActionCreatorCreator = (actionType, transformer) => {
  const originalActionCreator = (createAction(actionType, transformer): $IntentionalAny)
  originalActionCreator.type = actionType
  originalActionCreator.reducer = (cb: Function) => {
    const fn = (state, action) => cb(state, action)
    fn.type = actionType
    return fn
  }
  return originalActionCreator
}

export default ((actionCreator: $IntentionalAny): ActionCreatorCreator)
