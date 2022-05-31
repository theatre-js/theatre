import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {Observable} from 'rxjs'
import type {DevString} from './DevString'
import './rxjs'

/**
 * Required for UI to be able to react to whether something happened
 * synchronously or not
 */
export enum Outcome {
  Handled = 1,
  Passthrough = 0,
}

export class BestPracticeError<
  Path extends string,
  M extends string,
  T,
> extends Error {}
export class TSErrors<T> extends Error {}

const RxViewValid = Symbol('viewvalue')

declare module 'rxjs' {
  interface Observable<T> {
    /**
     * Attempt to get a {@link View$} valid version of this Observable.
     * This is only useful for the type checking to ensure that you're
     * playing by conventions for MVVM.
     */
    view$: ForView<T>
  }
}

Observable.prototype.view$ = function forView$(
  // this was only being used to enforce best practice type errors
  this: Observable<$IntentionalAny>,
) {
  return this
} as $IntentionalAny

export interface View$<T> extends Observable<T> {
  /** This comes through a call through {@link RxForView.forView} */
  [RxViewValid]: true
}

export type ForView<T> = _ForViewCheck<ForViewOk<T>, _ForView<T, ''>>

type ForViewOk<T> = (this: Observable<T>) => View$<T>

type ForViewCheck<
  T,
  Path extends string,
  Expect,
  Message extends string,
> = T extends Expect ? never : BestPracticeError<Path, Message, T>

type _ForViewCheck<T, E> = [E] extends [never] ? T : TSErrors<E>

/** Object recursive check for any errors. Returns `never` if there are no errors. */
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
    T extends Observable<infer _>
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
