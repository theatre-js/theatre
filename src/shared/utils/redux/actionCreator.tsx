import identity from '$shared/utils/identity'

interface Transformer<Input, Output> {
  (input: Input): Output
}

interface ActionCreatorCreator {
  <ActionType, Payload, Input>(
    actionType: ActionType,
    transformer: Transformer<Input, Payload>,
  ): {
    (input: Input): {type: ActionType; payload: Payload}
    type: ActionType
    ActionType: {type: ActionType; payload: Payload}
    is: (o: {}) => o is {type: ActionType; payload: Payload}
  }

  <ActionType>(actionType: ActionType): {
    <Payload>(payload: Payload): {type: ActionType; payload: Payload}
    (): {type: ActionType; payload: void}
    type: ActionType
    ActionType: {type: ActionType; payload: mixed}
    is: (o: mixed) => o is {type: ActionType; payload: mixed}
  }
}

/**
 * This is basically the same as {createAction} from 'redux-actions',
 * only that you can query the type of the action from the resulting
 * action creator.
 */
const actionCreator = (
  actionType: string,
  transformer: $IntentionalAny = identity,
) => {
  // const originalActionCreator = createAction(
  //   actionType,
  //   transformer,
  // ) as $IntentionalAny

  const originalActionCreator: $IntentionalAny = (
    payload: $IntentionalAny,
  ) => ({type: actionType, payload: transformer(payload)})

  originalActionCreator.type = actionType
  originalActionCreator.is = (o: $IntentionalAny) =>
    o && o.type && o.type === actionType

  return originalActionCreator
}

export default (actionCreator as $IntentionalAny) as ActionCreatorCreator
