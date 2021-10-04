import type {VoidFn} from '../types'
import AbstractDerivation from './AbstractDerivation'

const noop = () => {}

export default class DerivationFromSource<V> extends AbstractDerivation<V> {
  private _untapFromChanges: () => void
  private _cachedValue: undefined | V
  private _hasCachedValue: boolean

  constructor(
    private readonly _tapToSource: (listener: (newValue: V) => void) => VoidFn,
    private readonly _getValueFromSource: () => V,
  ) {
    super()
    this._untapFromChanges = noop
    this._cachedValue = undefined
    this._hasCachedValue = false
  }

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

  _keepHot() {
    this._hasCachedValue = false
    this._cachedValue = undefined

    this._untapFromChanges = this._tapToSource((newValue) => {
      this._hasCachedValue = true
      this._cachedValue = newValue
      this._markAsStale(this)
    })
  }

  _becomeCold() {
    this._untapFromChanges()
    this._untapFromChanges = noop

    this._hasCachedValue = false
    this._cachedValue = undefined
  }

  _reactToDependencyBecomingStale() {}
}
