import Tappable from './Tappable'

type Tapper<V> = (v: V) => void
type Untap = () => void

/**
 * An event emitter. Emit events that others can tap (subscribe to).
 */
export default class Emitter<V> {
  private _tappers: Map<any, (v: V) => void>
  private _lastTapperId: number
  private _onNumberOfTappersChangeListener: undefined | ((n: number) => void)

  /**
   * The Tappable associated with this emitter. You can use this to tap (subscribe to) events emitted.
   */
  readonly tappable: Tappable<V>

  constructor() {
    this._lastTapperId = 0
    this._tappers = new Map()
    this.tappable = new Tappable({
      tapToSource: (cb: Tapper<V>) => {
        return this._tap(cb)
      },
    })
  }

  _tap(cb: Tapper<V>): Untap {
    const tapperId = this._lastTapperId++
    this._tappers.set(tapperId, cb)
    this._onNumberOfTappersChangeListener &&
      this._onNumberOfTappersChangeListener(this._tappers.size)
    return () => {
      this._removeTapperById(tapperId)
    }
  }

  _removeTapperById(id: number) {
    const oldSize = this._tappers.size
    this._tappers.delete(id)
    const newSize = this._tappers.size
    if (oldSize !== newSize) {
      this._onNumberOfTappersChangeListener &&
        this._onNumberOfTappersChangeListener(this._tappers.size)
    }
  }

  /**
   * Emit a value.
   *
   * @param payload The value to be emitted.
   */
  emit(payload: V) {
    this._tappers.forEach((cb) => {
      cb(payload)
    })
  }

  /**
   * Checks whether the emitter has tappers (subscribers).
   */
  hasTappers() {
    return this._tappers.size !== 0
  }

  /**
   * Handler to execute when the number of tappers (subscribers) changes.
   *
   * @callback Emitter~numberOfTappersChangeHandler
   *
   * @param {number} n The current number of  tappers (subscribers).
   */

  /**
   * Calls callback when the number of tappers (subscribers) changes.
   *
   * @param {Emitter~requestCallback} cb The function to be called.
   */
  onNumberOfTappersChange(cb: (n: number) => void) {
    this._onNumberOfTappersChangeListener = cb
  }
}
