type ICallback = (t: number) => void

function createRafTicker() {
  if (typeof window !== 'undefined') {
    const ticker = new Ticker()
    // defined outside of callback so the function is only created once
    const rAFTick = (t: number) => ticker.tick(t)
    // This Ticker will schedule ticks on demand (when something needs to be scheduled)
    // Otherwise, if the application is idling, then no requestAnimationFrame calls will be necessary.
    ticker._setRequestTick(() => requestAnimationFrame(rAFTick))
    return ticker
  } else {
    const ticker = new Ticker()
    ticker.tick(0)
    setTimeout(() => ticker.tick(1), 0)
    console.log(
      `@theatre/dataverse requestAnimationFrame Ticker is running in a server rather than in a browser. We haven't gotten around to testing server-side rendering, so if something is working in the browser but not on the server, please file a bug: https://github.com/theatre-js/theatre/issues/new`,
    )
    return ticker
  }
}

let rafTicker: undefined | Ticker

/**
 * The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
 * external scheduling strategy, e.g. a raf.
 */
export default class Ticker {
  /** Get a shared `requestAnimationFrame` ticker. */
  static get raf(): Ticker {
    if (!rafTicker) {
      rafTicker = createRafTicker()
    }
    return rafTicker
  }
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _ticking: boolean = false
  private _requestTick?: () => void
  /**
   * Counts up for every tick executed.
   * Internally, this is used to measure ticks per second.
   *
   * This is "public" to TypeScript, because it's a tool for performance measurements.
   * Consider this as experimental, and do not rely on it always being here in future releases.
   */
  public __ticks = 0

  constructor() {
    this._scheduledForThisOrNextTick = new Set()
    this._scheduledForNextTick = new Set()
    this._timeAtCurrentTick = 0
  }

  /**
   * @internal experimental approach to allowing for ticking to be scheduled on demand
   * rather than having to always call tick on every frame, even if there is nothing
   * needing ticking.
   */
  _setRequestTick(requestTick: () => void) {
    this._requestTick = requestTick
  }

  _schedule() {
    if (!this._ticking && this._requestTick) this._requestTick()
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
    if (process.env.NODE_ENV === 'development') {
      if (!(this instanceof Ticker)) {
        throw new Error(
          'ticker.tick must be called while bound to the ticker. As in, "ticker.tick(time)" or "requestAnimationFrame((t) => ticker.tick(t))" for performance.',
        )
      }
    }
    if (
      this._scheduledForNextTick.size === 0 &&
      this._scheduledForThisOrNextTick.size === 0
    ) {
      return
    }

    this.__ticks++

    this._ticking = true
    this._timeAtCurrentTick = t
    for (const v of this._scheduledForNextTick) {
      this._scheduledForThisOrNextTick.add(v)
    }

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
    for (const fn of oldSet) {
      fn(time)
    }

    if (this._scheduledForThisOrNextTick.size > 0) {
      return this._tick(iterationNumber + 1)
    }
  }
}
