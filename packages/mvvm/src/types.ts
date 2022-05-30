import type {Disposable} from './Disposable'
import type {Rx} from './best-practices'

/** For `any`s that aren't meant to stay `any`*/
export type $FixMe = any
/** For `any`s that we don't care about */
export type $IntentionalAny = any

export type VoidFn = () => void

export type Tapper<T> = (value: T) => void

/**
 * Required for UI to be able to react to whether something happened
 * synchronously or not
 */
export enum Outcome {
  Handled = 1,
  Passthrough = 0,
}

// https://github.com/microsoft/TypeScript/issues/40462#issuecomment-689879308
/// <reference lib="esnext.asynciterable" />

/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol
  }
}

/** OPERATOR INTERFACES */

export interface UnaryFunction<T, R> {
  (source: T): R
}

export interface OperatorFunction<T, R> extends UnaryFunction<Rx<T>, Rx<R>> {}

export type FactoryOrValue<T> = T | (() => T)

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}

/**
 * A value and the time at which it was emitted.
 *
 * Emitted by the `timestamp` operator
 *
 * @see {@link timestamp}
 */
export interface Timestamp<T> {
  value: T
  /**
   * The timestamp. By default, this is in epoch milliseconds.
   * Could vary based on the timestamp provider passed to the operator.
   */
  timestamp: number
}

/**
 * A value emitted and the amount of time since the last value was emitted.
 *
 * Emitted by the `timeInterval` operator.
 *
 * @see {@link timeInterval}
 */
export interface TimeInterval<T> {
  value: T

  /**
   * The amount of time between this value's emission and the previous value's emission.
   * If this is the first emitted value, then it will be the amount of time since subscription
   * started.
   */
  interval: number
}

/** SUBSCRIPTION INTERFACES */

export interface Unsubscribable {
  unsubscribe(): void
}

export type TeardownLogic = Disposable | Unsubscribable | (() => void) | void

export interface SubscriptionLike extends Unsubscribable {
  unsubscribe(): void
  readonly closed: boolean
}

/**
 * Valid types that can be converted to observables.
 */
export type ObservableInput<T> =
  | Rx<T>
  | AsyncIterable<T>
  | PromiseLike<T>
  | ArrayLike<T>
  | Iterable<T>

/** SCHEDULER INTERFACES */

export interface SchedulerLike extends TimestampProvider {
  schedule<T>(
    work: (this: SchedulerAction<T>, state: T) => void,
    delay: number,
    state: T,
  ): Disposable
  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay: number,
    state?: T,
  ): Disposable
  schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay?: number,
    state?: T,
  ): Disposable
}

export interface SchedulerAction<T> extends Disposable {
  schedule(state?: T, delay?: number): Disposable
}

/**
 * This is a type that provides a method to allow RxJS to create a numeric timestamp
 */
export interface TimestampProvider {
  /**
   * Returns a timestamp as a number.
   *
   * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
   * the amount of time passed between events.
   */
  now(): number
}

/**
 * Extracts the type from an `ObservableInput<any>`. If you have
 * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
 * `Promise<number>`, etc, it will type as `number`.
 */
export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never

/**
 * Extracts a union of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `Observable<string>[]` or `Promise<string>[]` you would get
 * back a type of `string`.
 * If you pass in `[Observable<string>, Observable<number>]` you would
 * get back a type of `string | number`.
 */
export type ObservedValueUnionFromArray<X> = X extends Array<
  ObservableInput<infer T>
>
  ? T
  : never

/**
 * @deprecated Renamed to {@link ObservedValueUnionFromArray}. Will be removed in v8.
 */
export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>

/**
 * Extracts a tuple of element types from an `ObservableInput<any>[]`.
 * If you have `O extends ObservableInput<any>[]` and you pass in
 * `[Observable<string>, Observable<number>]` you would get back a type
 * of `[string, number]`.
 */
export type ObservedValueTupleFromArray<X> = {
  [K in keyof X]: ObservedValueOf<X[K]>
}

/**
 * Used to infer types from arguments to functions like {@link forkJoin}.
 * So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
 * et al.
 */
export type ObservableInputTuple<T> = {
  [K in keyof T]: ObservableInput<T[K]>
}

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 */
export type Cons<X, Y extends readonly any[]> = ((
  arg: X,
  ...rest: Y
) => any) extends (...args: infer U) => any
  ? U
  : never

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 */
export type Head<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: infer U,
  ...rest: any[]
) => any
  ? U
  : never

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 */
export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: any,
  ...rest: infer U
) => any
  ? U
  : never

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A extends readonly unknown[]> = A extends Array<
  infer T
>
  ? T
  : never

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | ''

export type TruthyTypesOf<T> = T extends Falsy ? never : T

/**
 * An observable with a `connect` method that is used to create a subscription
 * to an underlying source, connecting it with all consumers via a multicast.
 */
export interface Connectable<T> extends Rx<T> {
  /**
   * (Idempotent) Calling this method will connect the underlying source observable to all subscribed consumers
   * through an underlying {@link Subject}.
   * @returns A subscription, that when unsubscribed, will "disconnect" the source from the connector subject,
   * severing notifications to all consumers.
   */
  connect(): Disposable
}
