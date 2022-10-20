import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'
import type Tappable from '../utils/Tappable'

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
   * Returns a `Tappable` of the changes of this derivation. Only notifies when the
   * ticker ticks and if the value of the derivation is different than previous.
   */
  changes(ticker: Ticker): Tappable<V>

  /**
   * @deprecated use onStaleWithoutValues instead
   * Like {@link changes} but with a different performance model. `changesWithoutValues` returns a {@link Tappable} that
   * updates every time the derivation is updated, even if the value didn't change, and the callback is called without
   * the value. The advantage of this is that you have control over when the derivation is freshened, it won't
   * automatically be kept fresh.
   */
  changesWithoutValues(): Tappable<void>

  onStaleWithoutValues(): Tappable<void>
  onStale(): Tappable<V>

  /**
   * Keep the derivation hot, even if there are no tappers (subscribers).
   */
  keepHot(): VoidFn

  /**
   * Convenience method that taps (subscribes to) the derivation using `this.changes(ticker).tap(fn)` and immediately calls
   * the callback with the current value.
   *
   * @param ticker - The ticker to use for batching.
   * @param fn - The callback to call on update.
   *
   * @see changes
   */
  tapImmediate(ticker: Ticker, fn: (cb: V) => void): VoidFn

  /**
   * Add a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be made a dependent of this derivation.
   *
   * @see removeDependent
   */
  addDependent(d: IDependent): void

  /**
   * Remove a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be removed from as a dependent of this derivation.
   *
   * @see addDependent
   */
  removeDependent(d: IDependent): void

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
