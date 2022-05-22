type ICallback = (t: number) => void

/**
 * The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
 * external scheduling strategy, e.g. a raf.
 */
export default class Ticker {
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _ticking: boolean = false

  constructor(private readonly schedule?: () => void) {
    this._scheduledForThisOrNextTick = new Set()
    this._scheduledForNextTick = new Set()
    this._timeAtCurrentTick = 0
  }

  _schedule() {
    if (!this._ticking) this.schedule?.()
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
    this._schedule()
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
    this._schedule()
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

  /**
   * Triggers a tick which starts executing the callbacks scheduled for this tick.
   *
   * @param t - The time at the tick.
   *
   * @see onThisOrNextTick
   * @see onNextTick
   */
  tick(t: number = performance.now()) {
    if (
      this._scheduledForNextTick.size === 0 &&
      this._scheduledForThisOrNextTick.size === 0
    ) {
      return
    }

    this._ticking = true
    this._timeAtCurrentTick = t
    this._scheduledForNextTick.forEach((v) =>
      this._scheduledForThisOrNextTick.add(v),
    )
    this._scheduledForNextTick.clear()
    this._tick(0)
    this._ticking = false
    this._schedule()
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
    oldSet.forEach((fn) => {
      fn(time)
    })

    if (this._scheduledForThisOrNextTick.size > 0) {
      return this._tick(iterationNumber + 1)
    }
  }
}
