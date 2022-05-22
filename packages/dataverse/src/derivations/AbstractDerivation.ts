import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'
import type Tappable from '../utils/Tappable'
import DerivationEmitter from './DerivationEmitter'
import DerivationValuelessEmitter from './DerivationValuelessEmitter'
import distinct from './distinct'
import flatMap from './flatMap'
import type {IDerivation} from './IDerivation'
import map from './map'
import {
  reportResolutionEnd,
  reportResolutionStart,
} from './prism/discoveryMechanism'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void

/**
 * Represents a derivation whose changes can be tracked. To be used as the base class for all derivations.
 */
export default abstract class AbstractDerivation<V> implements IDerivation<V> {
  /**
   * Whether the object is a derivation.
   */
  readonly isDerivation: true = true
  protected _didMarkDependentsAsStale: boolean = false
  private _isHot: boolean = false

  private _isFresh: boolean = false

  /**
   * @internal
   */
  protected _lastValue: undefined | V = undefined

  /**
   * @internal
   */
  protected _dependents: Set<IDependent> = new Set()

  /**
   * @internal
   */
  protected _dependencies: Set<IDerivation<$IntentionalAny>> = new Set()

  /**
   * @internal
   */
  protected abstract _recalculate(): V

  /**
   * @internal
   */
  protected abstract _reactToDependencyBecomingStale(
    which: IDerivation<unknown>,
  ): void

  constructor() {}

  /**
   * Whether the derivation is hot.
   */
  get isHot(): boolean {
    return this._isHot
  }

  /**
   * @internal
   */
  protected _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._isHot) d.addDependent(this._internal_markAsStale)
  }

  /**
   * @internal
   */
  protected _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._isHot) d.removeDependent(this._internal_markAsStale)
  }

  /**
   * Returns a `Tappable` of the changes of this derivation.
   */
  changes(ticker: Ticker): Tappable<V> {
    return new DerivationEmitter(this, ticker).tappable()
  }

  /**
   * Like {@link AbstractDerivation.changes} but with a different performance model. `changesWithoutValues` returns a `Tappable` that
   * updates every time the derivation is updated, even if the value didn't change, and the callback is called without
   * the value. The advantage of this is that you have control over when the derivation is freshened, it won't
   * automatically be kept fresh.
   */
  changesWithoutValues(): Tappable<void> {
    return new DerivationValuelessEmitter(this).tappable()
  }

  /**
   * Keep the derivation hot, even if there are no tappers (subscribers).
   */
  keepHot() {
    return this.changesWithoutValues().tap(() => {})
  }

  /**
   * Convenience method that taps (subscribes to) the derivation using `this.changes(ticker).tap(fn)` and immediately calls
   * the callback with the current value.
   *
   * @param ticker - The ticker to use for batching.
   * @param fn - The callback to call on update.
   *
   * @see changes
   */
  tapImmediate(ticker: Ticker, fn: (cb: V) => void): VoidFn {
    const untap = this.changes(ticker).tap(fn)
    fn(this.getValue())
    return untap
  }

  /**
   * Add a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be made a dependent of this derivation.
   *
   * @see removeDependent
   */
  // TODO: document this better, what are dependents?
  addDependent(d: IDependent) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  /**
   * Remove a derivation as a dependent of this derivation.
   *
   * @param d - The derivation to be removed from as a dependent of this derivation.
   *
   * @see addDependent
   */
  removeDependent(d: IDependent) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  /**
   * This is meant to be called by subclasses
   *
   * @sealed
   * @internal
   */
  protected _markAsStale(which: IDerivation<$IntentionalAny>) {
    this._internal_markAsStale(which)
  }

  private _internal_markAsStale = (which: IDerivation<$IntentionalAny>) => {
    this._reactToDependencyBecomingStale(which)

    if (this._didMarkDependentsAsStale) return

    this._didMarkDependentsAsStale = true
    this._isFresh = false

    console.log('deps', ...this._dependents)
    this._dependents.forEach((dependent) => {
      dependent(this)
    })
  }

  /**
   * Gets the current value of the derivation. If the value is stale, it causes the derivation to freshen.
   */
  getValue(): V {
    reportResolutionStart(this)

    if (!this._isFresh) {
      const newValue = this._recalculate()
      this._lastValue = newValue
      if (this._isHot) {
        this._isFresh = true
        this._didMarkDependentsAsStale = false
      }
    }

    reportResolutionEnd(this)
    return this._lastValue!
  }

  private _reactToNumberOfDependentsChange() {
    const shouldBecomeHot = this._dependents.size > 0

    if (shouldBecomeHot === this._isHot) return

    this._isHot = shouldBecomeHot
    this._didMarkDependentsAsStale = false
    this._isFresh = false
    if (shouldBecomeHot) {
      this._dependencies.forEach((d) => {
        d.addDependent(this._internal_markAsStale)
      })
      this._keepHot()
    } else {
      this._dependencies.forEach((d) => {
        d.removeDependent(this._internal_markAsStale)
      })
      this._becomeCold()
    }
  }

  /**
   * @internal
   */
  protected _keepHot() {}

  /**
   * @internal
   */
  protected _becomeCold() {}

  /**
   * Creates a new derivation from this derivation using the provided mapping function. The new derivation's value will be
   * `fn(thisDerivation.getValue())`.
   *
   * @param fn - The mapping function to use. Note: it accepts a plain value, not a derivation.
   */
  map<T>(fn: (v: V) => T): IDerivation<T> {
    return map(this, fn)
  }

  /**
   *
   */
  distinct(eq?: (a: V, b: V) => boolean): IDerivation<V> {
    return distinct(this, eq)
  }

  /**
   * Same as {@link AbstractDerivation.map}, but the mapping function can also return a derivation, in which case the derivation returned
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
  ): IDerivation<R extends IDerivation<infer T> ? T : R> {
    return flatMap(this, fn)
  }
}
