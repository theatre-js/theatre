import type {$IntentionalAny} from '../types'
import type Tappable from '../utils/Tappable'
import DerivationEmitter from './DerivationEmitter'
import flatMap from './flatMap'
import type {GraphNode, IDerivation} from './IDerivation'
import map from './map'
import {
  reportResolutionEnd,
  reportResolutionStart,
} from './prism/discoveryMechanism'

export default abstract class AbstractDerivation<V> implements IDerivation<V> {
  readonly isDerivation: true = true
  private _didMarkDependentsAsStale: boolean = false
  private _isHot: boolean = false

  private _isFresh: boolean = false
  protected _lastValue: undefined | V = undefined

  protected _dependents: Set<GraphNode> = new Set()
  protected _dependencies: Set<IDerivation<$IntentionalAny>> = new Set()
  /**
   * _height is the maximum height of all dependents, plus one.
   *
   * -1 means it's not yet calculated
   * 0 is reserved only for listeners
   */
  private _height: number = -1

  private _graphNode: GraphNode

  protected abstract _recalculate(): V
  protected abstract _reactToDependencyBecomingStale(
    which: IDerivation<unknown>,
  ): void

  constructor() {
    const self = this
    this._graphNode = {
      get height() {
        return self._height
      },
      recalculate() {
        // @todo
      },
    }
  }

  get isHot(): boolean {
    return this._isHot
  }

  get height() {
    return this._height
  }

  protected _addDependency(d: IDerivation<$IntentionalAny>) {
    if (this._dependencies.has(d)) return
    this._dependencies.add(d)
    if (this._isHot) d.addDependent(this._graphNode)
  }

  protected _removeDependency(d: IDerivation<$IntentionalAny>) {
    if (!this._dependencies.has(d)) return
    this._dependencies.delete(d)
    if (this._isHot) d.removeDependent(this._graphNode)
  }

  changes(): Tappable<V> {
    return new DerivationEmitter(this).tappable()
  }

  addDependent(d: GraphNode) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.add(d)

    if (d.height > this._height - 1) {
      this._setHeight(d.height + 1)
    }

    if (!hadDepsBefore) {
      this._reactToNumberOfDependentsChange()
    }
  }

  /**
   * @sealed
   */
  removeDependent(d: GraphNode) {
    const hadDepsBefore = this._dependents.size > 0
    this._dependents.delete(d)
    const hasDepsNow = this._dependents.size > 0
    if (hadDepsBefore !== hasDepsNow) {
      this._reactToNumberOfDependentsChange()
    }
  }

  reportDependentHeightChange(d: GraphNode) {
    if (process.env.NODE_ENV === 'development') {
      if (!this._dependents.has(d)) {
        throw new Error(
          `Got a reportDependentHeightChange from a non-dependent.`,
        )
      }
    }
    this._recalculateHeight()
  }

  private _recalculateHeight() {
    let maxHeightOfDependents = -1
    this._dependents.forEach((d) => {
      maxHeightOfDependents = Math.max(maxHeightOfDependents, d.height)
    })
    const newHeight = maxHeightOfDependents + 1
    if (this._height !== newHeight) {
      this._setHeight(newHeight)
    }
  }

  private _setHeight(h: number) {
    this._height = h
    this._dependencies.forEach((d) => {
      d.reportDependentHeightChange(this._graphNode)
    })
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
      dependent.recalculate()
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
        d.addDependent(this._graphNode)
      })
      this._keepHot()
    } else {
      this._dependencies.forEach((d) => {
        d.removeDependent(this._graphNode)
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
