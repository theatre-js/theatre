// @flow

export type Reducer<State, Action> =
  (s: State | void, a: Action) => State