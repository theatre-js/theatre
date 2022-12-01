import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void

/**
 * Common interface for derivations.
 */
export interface IDerivation<V> {
  /**
   * Whether the object is a derivation.
   */
  isDerivation: true

  /**
   * Whether the derivation is hot.
   */
  isHot: boolean

  /**
   * Calls `listener` with a fresh value every time the prism _has_ a new value, throttled by Ticker.
   */
  onChange(
    ticker: Ticker,
    listener: (v: V) => void,
    immediate?: boolean,
  ): VoidFn

  onStale(cb: () => void): VoidFn

  /**
   * Keep the derivation hot, even if there are no tappers (subscribers).
   */
  keepHot(): VoidFn

  /**
   * Add a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be made a dependent of this derivation.
   *
   * @see _removeDependent
   *
   * @internal
   */
  _addDependent(d: IDependent): void

  /**
   * Remove a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be removed from as a dependent of this derivation.
   *
   * @see _addDependent
   * @internal
   */
  _removeDependent(d: IDependent): void

  /**
   * Gets the current value of the derivation. If the value is stale, it causes the derivation to freshen.
   */
  getValue(): V

  /**
   * Creates a new derivation from this derivation using the provided mapping function. The new derivation's value will be
   * `fn(thisDerivation.getValue())`.
   *
   * @param fn - The mapping function to use. Note: it accepts a plain value, not a derivation.
   */
  map<T>(fn: (v: V) => T): IDerivation<T>

  /**
   * Same as {@link IDerivation.map}, but the mapping function can also return a derivation, in which case the derivation returned
   * by `flatMap` takes the value of that derivation.
   *
   * @example
   * ```ts
   * // Simply using map() here would return the inner derivation when we call getValue()
   * new Box(3).derivation.map((value) => new Box(value).derivation).getValue()
   *
   * // Using flatMap() eliminates the inner derivation
   * new Box(3).derivation.flatMap((value) => new Box(value).derivation).getValue()
   * ```
   *
   * @param fn - The mapping function to use. Note: it accepts a plain value, not a derivation.
   */
  flatMap<R>(
    fn: (v: V) => R,
  ): IDerivation<R extends IDerivation<infer T> ? T : R>
}

/**
 * Returns whether `d` is a derivation.
 */
export function isDerivation(d: any): d is IDerivation<unknown> {
  return d && d.isDerivation && d.isDerivation === true
}
