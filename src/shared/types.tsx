export type GenericAction = {type: string; payload: mixed | void}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: GenericAction,
) => State
