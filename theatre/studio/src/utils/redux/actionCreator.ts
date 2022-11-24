import type {$IntentionalAny} from '@theatre/shared/utils/types'

function identity<T>(a: T) {
  return a
}

interface Transformer<
  Input extends $IntentionalAny,
  Output extends $IntentionalAny,
> {
  (input: Input): Output
}

type SubString<T> = T extends string ? (string extends T ? never : T) : never

interface ActionCreatorCreator {
  <ActionType extends string, Payload, Input>(
    actionType: SubString<ActionType>,
    transformer: Transformer<Input, Payload>,
  ): {
    (input: Input): {type: SubString<ActionType>; payload: Payload}
    type: SubString<ActionType>
    ActionType: {type: SubString<ActionType>; payload: Payload}
    is: (
      o: $IntentionalAny,
    ) => o is {type: SubString<ActionType>; payload: Payload}
  }

  <ActionType extends string>(actionType: SubString<ActionType>): {
    <Payload>(payload: Payload): {type: SubString<ActionType>; payload: Payload}
    (): {type: SubString<ActionType>; payload: void}
    type: SubString<ActionType>
    ActionType: {type: SubString<ActionType>; payload: unknown}
    is: (o: unknown) => o is {type: SubString<ActionType>; payload: unknown}
  }
}

/**
 * This is basically the same as `{createAction}` from 'redux-actions',
 * only that you can query the type of the action from the resulting
 * action creator.
 */
const actionCreator: ActionCreatorCreator = (
  actionType: string,
  transformer: $IntentionalAny = identity,
) => {
  const originalActionCreator: $IntentionalAny = (
    payload: $IntentionalAny,
  ) => ({type: actionType, payload: transformer(payload)})

  originalActionCreator.type = actionType
  originalActionCreator.is = (o: $IntentionalAny) =>
    o && o.type && o.type === actionType

  return originalActionCreator
}

export default actionCreator
