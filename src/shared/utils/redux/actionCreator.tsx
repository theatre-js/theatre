import {createAction} from 'redux-actions'

type Reducer<ActionType, Payload> = <State>(
  callback: (
    state: State,
    action: {type: ActionType; payload: Payload},
  ) => State,
) => {
  (state: State, action: {type: ActionType; payload: Payload}): State
  type: ActionType
}

interface Transformer<Input, Output> {
  (input: Input): Output
}

interface ActionCreatorCreator {
  <ActionType, Payload, Input, T extends Transformer<Input, Payload>>(
    actionType: ActionType,
    transformer: T,
  ): {
    (input: Input): {type: ActionType; payload: Payload}
    type: ActionType
    reducer: Reducer<ActionType, Payload>
  }

  <ActionType>(actionType: ActionType): {
    <Payload>(payload: Payload): {type: ActionType; payload: Payload}
    (): {type: ActionType; payload: void}
    type: ActionType
    reducer: Reducer<ActionType, any>
  }
}

/**
 * This is basically the same as {createAction} from 'redux-actions',
 * only that you can query the type of the action from the resulting
 * action creator.
 */
const actionCreator = (actionType: string, transformer?: $IntentionalAny) => {
  const originalActionCreator = createAction(
    actionType,
    transformer,
  ) as $IntentionalAny
  originalActionCreator.type = actionType
  originalActionCreator.reducer = (cb: Function) => {
    const fn = (state: $IntentionalAny, action: $IntentionalAny) =>
      cb(state, action)
    // @ts-ignore @ignore
    fn.type = actionType
    return fn
  }
  return originalActionCreator
}

export default (actionCreator as $IntentionalAny) as ActionCreatorCreator
