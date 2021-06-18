import type Ticker from '../Ticker'
import type {$IntentionalAny, VoidFn} from '../types'
import type Tappable from '../utils/Tappable'
import DerivationEmitter from './DerivationEmitter'
import DerivationValuelessEmitter from './DerivationValuelessEmitter'
import flatMap from './flatMap'
import type {IDerivation} from './IDerivation'
import map from './map'
import {
  reportResolutionEnd,
  reportResolutionStart,
} from './prism/discoveryMechanism'

type IDependent = (msgComingFrom: IDerivation<$IntentionalAny>) => void
export default abstract class AbstractDerivation<V> implements IDerivation<V> {
  readonly isDerivation: true = true
  private _didMarkDependentsAsStale: boolean = false
  private _isHot: boolean = false

  private _isFresh: boolean = false
  protected _lastValue: undefined | V = undefined

  protected _dependents: Set<IDependent> = new Set()
  protected _dependencies: Set<IDerivation<$IntentionalAny>> = new Set()

  protected abstract _recalculate(): V
  protected abstract _reactToDependencyBecomingStale(
    which: IDerivation<unknown>,
  ): void

  constructor() {}

  get isHot(): boolean {
    return this._isHot
  }

  protected _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._isHot) d.addDependent(this._internal_markAsStale)
  }

  protected _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._isHot) d.removeDependent(this._internal_markAsStale)
  }

  changes(ticker: Ticker): Tappable<V> {
    return new DerivationEmitter(this, ticker).tappable()
  }

  changesWithoutValues(): Tappable<void> {
    return new DerivationValuelessEmitter(this).tappable()
  }

  keepHot() {
    return this.changesWithoutValues().tap(() => {})
  }

  tapImmediate(ticker: Ticker, fn: (cb: V) => void): VoidFn {
    const untap = this.changes(ticker).tap(fn)
    fn(this.getValue())
    return untap
  }

  addDependent(d: IDependent) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  /**
   * @sealed
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
   */
  protected _markAsStale(which: IDerivation<$IntentionalAny>) {
    this._internal_markAsStale(which)
  }

  private _internal_markAsStale = (which: IDerivation<$IntentionalAny>) => {
    this._reactToDependencyBecomingStale(which)

    if (this._didMarkDependentsAsStale) return

    this._didMarkDependentsAsStale = true
    this._isFresh = false

    this._dependents.forEach((dependent) => {
      dependent(this)
    })
  }

  getValue(): V {
    reportResolutionStart(this)

    if (!this._isFresh) {
      const newValue = this._recalculate()
      this._lastValue = newValue
      if (this.isHot) {
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

  protected _keepHot() {}

  protected _becomeCold() {}

  map<T>(fn: (v: V) => T): IDerivation<T> {
    return map(this, fn)
  }

  flatMap<R>(
    fn: (v: V) => R,
  ): IDerivation<R extends IDerivation<infer T> ? T : R> {
    return flatMap(this, fn)
  }
}
