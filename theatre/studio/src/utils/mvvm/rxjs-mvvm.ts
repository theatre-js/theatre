import {Observable} from 'rxjs'
import './rxjs'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {DevString} from '@theatre/studio/utils/DevString'

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

// This is never actually set, it's just for type support
declare const VMValid: unique symbol

declare module 'rxjs' {
  interface Observable<T> {
    /**
     * Get the viewmodel-safe observable value
     *
     * Attempt to get a {@link VM$} valid version of this Observable.
     * This is only useful for the type checking to ensure that you're
     * playing by conventions for MVVM.
     */
    vm$: ForVM$<T>
  }
}

Observable.prototype.vm$ = function forView$(
  // this was only being used to enforce best practice type errors
  this: Observable<$IntentionalAny>,
) {
  return this
} as $IntentionalAny

export interface VM$<T> extends Observable<T> {
  /** This comes through a call through {@link Observable.vm$} */
  [VMValid]: true
}

type ForVM$<T> = _VMCheck<ForVM$Fn<T>, _VMErrors<T, ''>>

type VMValidMarker = {
  [VMValid]: true
}

/**
 * Best practices type checker which can wrap your view type
 * such as in:
 * ```ts
 * type TogglerView = View<{
 *   displayLabel: string,
 *   toggleValue$: View$<boolean>,
 *   setToggle(value: boolean): Outcome
 *   toggle(): Outcome
 * }>
 *
 * view<TogglerView>({
 *   ...
 * })
 * ```
 *
 * See {@link vm}
 */
export type VM<T> = T extends VMValidMarker
  ? T
  : _VMCheck<T & VMValidMarker, _VMErrors<T, ''>>

/** See {@link VM} */
export function vm<T>(viewModel: T): VM<T> {
  // @ts-ignore
  return viewModel
}

type ForVM$Fn<T> = (this: Observable<T>) => VM$<T>

type _VMExtendsCheck<
  T,
  Path extends string,
  Expect,
  Message extends string,
> = T extends Expect ? never : BestPracticeError<Path, Message, T>

type _VMCheck<T, E> = [E] extends [never] ? T : TSErrors<E>

/** Object recursive check for any errors. Returns `never` if there are no errors. */
type _VMErrors<T, Path extends string> =
  // any
  [any extends T ? never : true] extends [never]
    ? BestPracticeError<Path, 'any is forbidden', T>
    : // already checked
    T extends VMValidMarker
    ? never
    : // fn
    T extends (...args: any) => any
    ?
        | _VMExtendsCheck<
            T,
            Path,
            ((...args: any) => undefined | void) | ((...args: any) => Outcome),
            `functions may not return, or may return Outcome`
          >
        | _VMExtendsCheck<
            T,
            Path,
            | ((noarg: void) => any)
            | ((reason: DevString) => any)
            // inputs only, WIP to understand the limitations better
            | ((inputValue: string) => Outcome)
            | ((inputValue: boolean) => Outcome)
            | ((inputValue: number) => Outcome),
            `functions may only take no args, a DevString, or simple values from inputs which return Outcomes`
          >
    : // nested
    T extends Observable<infer _>
    ? _VMExtendsCheck<
        T,
        Path,
        VMValidMarker,
        `reactive values must themselves be view values`
      >
    : //
    // array
    T extends (infer R)[]
    ? _VMErrors<R, `${Path}[number]`>
    : T extends Record<string, any>
    ? {
        [P in Extract<keyof T, string | number>]: _VMErrors<
          T[P],
          `${Path}.${P}`
        >
      }[Extract<keyof T, string | number>]
    : // primitives
      _VMExtendsCheck<T, Path, number | string, 'Expected simple data'>
