import type {DevString} from './DevString'
import type {Disposable} from './Disposable'
import type {Outcome, Tapper} from './types'

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

export abstract class Rx<T> {
  [RxType]: T = undefined!
  abstract tap(disposable: Disposable, tapper: Tapper<T>): void
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
