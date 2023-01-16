type ICallback = (t: number) => void

/**
 * The number of ticks that can pass without any scheduled callbacks before the Ticker goes dormant. This is to prevent
 * the Ticker from staying active forever, even if there are no scheduled callbacks.
 *
 * Perhaps counting ticks vs. time is not the best way to do this. But it's a start.
 */
export const EMPTY_TICKS_BEFORE_GOING_DORMANT = 60 /*fps*/ * 3 /*seconds*/ // on a 60fps screen, 3 seconds should pass before the ticker goes dormant

/**
 * The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
 * external scheduling strategy, e.g. a raf.
 */
export default class Ticker {
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _ticking: boolean = false

  /**
   * Whether the Ticker is dormant
   */
  private _dormant: boolean = true

  private _numberOfDormantTicks = 0

  /**
   * Whether the Ticker is dormant
   */
  get dormant(): boolean {
    return this._dormant
  }
  /**
   * Counts up for every tick executed.
   * Internally, this is used to measure ticks per second.
   *
   * This is "public" to TypeScript, because it's a tool for performance measurements.
   * Consider this as experimental, and do not rely on it always being here in future releases.
   */
  public __ticks = 0

  constructor(
    private _conf?: {
      /**
       * This is called when the Ticker goes dormant.
       */
      onDormant?: () => void
      /**
       * This is called when the Ticker goes active.
       */
      onActive?: () => void
    },
  ) {
    this._scheduledForThisOrNextTick = new Set()
    this._scheduledForNextTick = new Set()
    this._timeAtCurrentTick = 0
  }

  /**
   * Registers for fn to be called either on this tick or the next tick.
   *
   * If `onThisOrNextTick()` is called while `Ticker.tick()` is running, the
   * side effect _will_ be called within the running tick. If you don't want this
   * behavior, you can use `onNextTick()`.
   *
   * Note that `fn` will be added to a `Set()`. Which means, if you call `onThisOrNextTick(fn)`
   * with the same fn twice in a single tick, it'll only run once.
   *
   * @param fn - The function to be registered.
   *
   * @see offThisOrNextTick
   */
  onThisOrNextTick(fn: ICallback) {
    this._scheduledForThisOrNextTick.add(fn)
    if (this._dormant) {
      this._goActive()
    }
  }

  /**
   * Registers a side effect to be called on the next tick.
   *
   * @param fn - The function to be registered.
   *
   * @see onThisOrNextTick
   * @see offNextTick
   */
  onNextTick(fn: ICallback) {
    this._scheduledForNextTick.add(fn)
    if (this._dormant) {
      this._goActive()
    }
  }

  /**
   * De-registers a fn to be called either on this tick or the next tick.
   *
   * @param fn - The function to be de-registered.
   *
   * @see onThisOrNextTick
   */
  offThisOrNextTick(fn: ICallback) {
    this._scheduledForThisOrNextTick.delete(fn)
  }

  /**
   * De-registers a fn to be called on the next tick.
   *
   * @param fn - The function to be de-registered.
   *
   * @see onNextTick
   */
  offNextTick(fn: ICallback) {
    this._scheduledForNextTick.delete(fn)
  }

  /**
   * The time at the start of the current tick if there is a tick in progress, otherwise defaults to
   * `performance.now()`.
   */
  get time() {
    if (this._ticking) {
      return this._timeAtCurrentTick
    } else return performance.now()
  }

  private _goActive() {
    if (!this._dormant) return
    this._dormant = false
    this._conf?.onActive?.()
  }

  private _goDormant() {
    if (this._dormant) return
    this._dormant = true
    this._numberOfDormantTicks = 0
    this._conf?.onDormant?.()
  }

  /**
   * Triggers a tick which starts executing the callbacks scheduled for this tick.
   *
   * @param t - The time at the tick.
   *
   * @see onThisOrNextTick
   * @see onNextTick
   */
  tick(t: number = performance.now()) {
    if (process.env.NODE_ENV === 'development') {
      if (!(this instanceof Ticker)) {
        throw new Error(
          'ticker.tick must be called while bound to the ticker. As in, "ticker.tick(time)" or "requestAnimationFrame((t) => ticker.tick(t))" for performance.',
        )
      }
    }

    this.__ticks++

    if (!this._dormant) {
      if (
        this._scheduledForNextTick.size === 0 &&
        this._scheduledForThisOrNextTick.size === 0
      ) {
        this._numberOfDormantTicks++
        if (this._numberOfDormantTicks >= EMPTY_TICKS_BEFORE_GOING_DORMANT) {
          this._goDormant()
          return
        }
      }
    }

    this._ticking = true
    this._timeAtCurrentTick = t
    for (const v of this._scheduledForNextTick) {
      this._scheduledForThisOrNextTick.add(v)
    }

    this._scheduledForNextTick.clear()
    this._tick(0)
    this._ticking = false
  }

  private _tick(iterationNumber: number): void {
    const time = this.time

    if (iterationNumber > 10) {
      console.warn('_tick() recursing for 10 times')
    }

    if (iterationNumber > 100) {
      throw new Error(`Maximum recursion limit for _tick()`)
    }

    const oldSet = this._scheduledForThisOrNextTick
    this._scheduledForThisOrNextTick = new Set()
    for (const fn of oldSet) {
      fn(time)
    }

    if (this._scheduledForThisOrNextTick.size > 0) {
      return this._tick(iterationNumber + 1)
    }
  }
}
