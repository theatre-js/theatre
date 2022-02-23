import type {VoidFn} from '../types'
import AbstractDerivation from './AbstractDerivation'

const noop = () => {}

/**
 * Represents a derivation based on a tappable (subscribable) data source.
 */
export default class DerivationFromSource<V> extends AbstractDerivation<V> {
  private _untapFromChanges: () => void
  private _cachedValue: undefined | V
  private _hasCachedValue: boolean

  /**
   * @param _tapToSource - A function that takes a listener and subscribes it to the underlying data source.
   * @param _getValueFromSource - A function that returns the current value of the data source.
   */
  constructor(
    private readonly _tapToSource: (listener: (newValue: V) => void) => VoidFn,
    private readonly _getValueFromSource: () => V,
  ) {
    super()
    this._untapFromChanges = noop
    this._cachedValue = undefined
    this._hasCachedValue = false
  }

  /**
   * @internal
   */
  _recalculate() {
    if (this.isHot) {
      if (!this._hasCachedValue) {
        this._cachedValue = this._getValueFromSource()
        this._hasCachedValue = true
      }
      return this._cachedValue as V
    } else {
      return this._getValueFromSource()
    }
  }

  /**
   * @internal
   */
  _keepHot() {
    this._hasCachedValue = false
    this._cachedValue = undefined

    this._untapFromChanges = this._tapToSource((newValue) => {
      this._hasCachedValue = true
      this._cachedValue = newValue
      this._markAsStale(this)
    })
  }

  /**
   * @internal
   */
  _becomeCold() {
    this._untapFromChanges()
    this._untapFromChanges = noop

    this._hasCachedValue = false
    this._cachedValue = undefined
  }

  /**
   * @internal
   */
  _reactToDependencyBecomingStale() {}
}
