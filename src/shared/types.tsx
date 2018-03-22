export type GenericAction = {type: string; payload: mixed | void}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: GenericAction,
) => State

export type ErrorsOf<T> = 
  T extends (...args: $IntentionalAny[]) => 
    Generator_<infer R> ? R extends {errorType: string} ? R : never : never

export type ReturnOf<Fn> =
  Fn extends (...args: $IntentionalAny[]) => 
    Generator_<infer R> ? R : never