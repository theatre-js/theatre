import type {DevString} from './DevString'
import type {Disposable, TeardownLogic} from './Disposable'
import type {Outcome, Tapper} from './types'
import {pipeFromArray} from './utils/pipe'

export class BestPracticeError<
  Path extends string,
  M extends string,
  T,
> extends Error {}
export class TSErrors<T> extends Error {}

const RxViewValid = Symbol('viewvalue')
const RxType = Symbol('rxvalue')
export interface ViewRx<T> extends Rx<T> {
  /** This comes through a call through {@link RxForView.forView} */
  [RxViewValid]: true
}

export interface UnaryFunction<T, R> {
  (source: T): R
}

/***
 * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
 */
export interface Operator<T, R> {
  call(tapper: Tapper<R>, source: any): TeardownLogic
}

export interface OperatorFunction<T, R> extends UnaryFunction<Rx<T>, Rx<R>> {}

export class Rx<T> {
  [RxType]: T = undefined!
  /**
   * @internal Internal implementation detail, do not use directly. Will be made internal in v8.
   */
  source: Rx<T> | undefined
  /**
   * @internal Internal implementation detail, do not use directly. Will be made internal in v8.
   */
  operator: Operator<any, T> | undefined

  constructor(
    subscribe?: (
      this: Rx<T>,
      disposable: Disposable,
      tapper: Tapper<T>,
    ) => void,
  ) {
    if (subscribe) {
      this._subscribe = subscribe
    }
  }

  /** @internal */
  protected _subscribe(disposable: Disposable, tapper: Tapper<any>): void {
    this.source?.tap(disposable, tapper)
  }

  tap(disposable: Disposable, tapper: Tapper<T>): void {}

  /** @internal */
  protected _tap(disposable: Disposable, tapper: Tapper<any>): void {
    this.source?.tap(disposable, tapper)
  }

  pipe(): Rx<T>
  pipe<A>(op1: OperatorFunction<T, A>): Rx<A>
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Rx<B>
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
  ): Rx<C>
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
  ): Rx<D>
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
  ): Rx<E>
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
  ): Rx<F>
  pipe<A, B, C, D, E, F, G>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
  ): Rx<G>
  pipe<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
  ): Rx<H>
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
  ): Rx<I>
  pipe<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): Rx<unknown>
  pipe(...ops: OperatorFunction<any, any>[]): Rx<any> {
    return pipeFromArray(ops)(this)
  }
}

export interface RxForView<T> extends Rx<T> {
  forView: ForView<T>
}

export type ForView<T> = _ForViewCheck<ForViewOk<T>, _ForView<T, ''>>

type ForViewOk<T> = (this: Rx<T>) => ViewRx<T>
type ForViewCheck<
  T,
  Path extends string,
  Expect,
  Message extends string,
> = T extends Expect ? never : BestPracticeError<Path, Message, T>

type _ForViewCheck<T, E> = [E] extends [never] ? T : TSErrors<E>

type IsAny<T> = [any extends T ? never : 0] extends [never] ? true : false
type A = IsAny<string>
type A2 = IsAny<any>
type A3 = IsAny<never>

type _ForView<T, Path extends string> =
  // any
  [any extends T ? never : true] extends [never]
    ? BestPracticeError<Path, 'any is forbidden', T>
    : // fn
    T extends (...args: any) => any
    ?
        | ForViewCheck<
            T,
            Path,
            ((...args: any) => undefined | void) | ((...args: any) => Outcome),
            `functions may not return, or may return Outcome`
          >
        | ForViewCheck<
            T,
            Path,
            ((noarg: void) => any) | ((reason: DevString) => any),
            `functions may only take no args or an optional DevString`
          >
    : // nested
    T extends {[RxType]: infer _}
    ? ForViewCheck<
        T,
        Path,
        {[RxViewValid]: true},
        `reactive values must themselves be view values`
      >
    : //
    // array
    T extends (infer R)[]
    ? _ForView<R, `${Path}[number]`>
    : T extends Record<string, any>
    ? {
        [P in Extract<keyof T, string | number>]: _ForView<T[P], `${Path}.${P}`>
      }[Extract<keyof T, string | number>]
    : // primitives
      ForViewCheck<T, Path, number | string, 'Expected simple data'>

declare function checkForView<T>(value: T): RxForView<T>
