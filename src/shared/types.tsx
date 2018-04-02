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

export type PromiseValue<P> =
  P extends Promise<infer R> ? R : never

export type VoidFn = () => void

/**
 * Useful in type tests, such as: const a: SomeType = _any
 */
export const _any: $IntentionalAny = null

/**
 * Useful in typeTests. If you want to ensure that value v follows type V,
 * just write `expectType<V>(v)`
 */
export const expectType = <T extends mixed>(v: T): T => v