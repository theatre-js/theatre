import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'
import type Tappable from '../utils/Tappable'
import DerivationEmitter from './DerivationEmitter'
import DerivationValuelessEmitter from './DerivationValuelessEmitter'
import type {IDerivation} from './IDerivation'
import {
  reportResolutionEnd,
  reportResolutionStart,
} from './prism/discoveryMechanism'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void

type State<V> =
  | {
      hot: false
    }
  | {
      hot: true
      dependents: Set<IDependent>
      freshness:
        | {
            isFresh: true
            value: V
          }
        | {
            isFresh: false
            value: V | undefined
            didMarkDepndentsAsStale: boolean
          }
    }

/**
 * Represents a derivation whose changes can be tracked. To be used as the base class for all derivations.
 */
export default abstract class AbstractDerivation<V> implements IDerivation<V> {
  /**
   * Whether the object is a derivation.
   */
  readonly isDerivation: true = true

  private _state: State<V> = {hot: false}

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
    return this._state.hot
  }

  /**
   * @internal
   */
  protected _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._state.hot) d.addDependent(this._internal_markAsStale)
  }

  /**
   * @internal
   */
  protected _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._state.hot) d.removeDependent(this._internal_markAsStale)
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
    if (this._state.hot) {
      this._state.dependents.add(d)
    } else {
      this._state = {
        hot: true,
        dependents: new Set([d]),
        freshness: {
          isFresh: false,
          value: undefined,
          didMarkDepndentsAsStale: false,
        },
      }
      for (const dependency of this._dependencies) {
        dependency.addDependent(this._internal_markAsStale)
      }
      this._keepHot()
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
    if (this._state.hot) {
      this._state.dependents.delete(d)
      if (this._state.dependents.size === 0) {
        this._state = {
          hot: false,
        }
        for (const dependency of this._dependencies) {
          dependency.removeDependent(this._internal_markAsStale)
        }
        this._becomeCold()
      }
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
    const state = this._state
    if (!state.hot) return
    this._reactToDependencyBecomingStale(which)

    const self = this
    function reportStalenessToDependents(dependents: Set<IDependent>) {
      for (const dependent of dependents) {
        dependent(self)
      }
    }

    if (state.freshness.isFresh) {
      state.freshness = {
        isFresh: false,
        didMarkDepndentsAsStale: true,
        value: state.freshness.value,
      }
      reportStalenessToDependents(state.dependents)
    } else if (!state.freshness.didMarkDepndentsAsStale) {
      state.freshness.didMarkDepndentsAsStale = true
      reportStalenessToDependents(state.dependents)
    }
  }

  /**
   * Gets the current value of the derivation. If the value is stale, it causes the derivation to freshen.
   */
  getValue(): V {
    /**
     * TODO We should prevent (or warn about) a common mistake users make, which is reading the value of
     * a derivation in the body of a react component (e.g. `der.getValue()` (often via `val()`) instead of `useVal()`
     * or `uesPrism()`).
     *
     * Although that's the most common example of this mistake, you can also find it outside of react components.
     * Basically the user runs `der.getValue()` assuming the read is detected by a wrapping prism when it's not.
     *
     * Sometiems the derivation isn't even hot when the user assumes it is.
     *
     * We can fix this type of mistake by:
     * 1. Warning the user when they call `getValue()` on a cold derivation.
     * 2. Warning the user about calling `getValue()` on a hot-but-stale derivation
     *    if `getValue()` isn't called by a known mechanism like a `DerivationEmitter`.
     *
     * Design constraints:
     * - This fix should not have a perf-penalty in production. Perhaps use a global flag + `process.env.NODE_ENV !== 'production'`
     *   to enable it.
     * - In the case of `DerivationValuelessEmitter`, we don't control when the user calls
     *   `getValue()` (as opposed to `DerivationEmitter` which calls `getValue()` directly).
     *   Perhaps we can disable the check in that case.
     * - Probably the best place to add this check is right here in this method plus some changes to `reportResulutionStart()`,
     *   which would have to be changed to let the caller know if there is an actual collector (a prism)
     *   present in its stack.
     */
    reportResolutionStart(this)

    const state = this._state

    if (state.hot) {
      const {freshness} = state
      if (freshness.isFresh) {
        reportResolutionEnd(this)
        return freshness.value
      } else {
        const value = this._recalculate()
        state.freshness = {isFresh: true, value}
        reportResolutionEnd(this)
        return value
      }
    } else {
      const value = this._recalculate()
      reportResolutionEnd(this)
      return value
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
}
