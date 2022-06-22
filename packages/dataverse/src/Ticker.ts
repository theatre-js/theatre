type ICallback = (t: number) => void

let rafTicker: undefined | Ticker

export type DriverFn = (update: (time: number) => void) => () => void

/**
 * Class to be used to update something at _regular_ intervals, such as on animation frames.
 *
 * @remarks If used with a Ticker, Ticker.applyTicker will automatically take care of
 * starting and stopping the driver.
 */
export class AnimationDriver {
  private _driverFn: DriverFn
  private _stopFn?: () => void

  /**
   * Creates a new AnimationDriver that will use the given updater function.
   *
   * @param driverFn - The function to be used to update the driver. Must return
   * a function that will be called to stop the driver.
   */
  constructor(driverFn: (update: (time: number) => void) => () => void) {
    this._driverFn = driverFn
  }

  /** Starts the driver. The given function will be called by the updater at regular
   * intervals.
   * */
  start(update: ICallback) {
    this.stop()
    this._stopFn = this._driverFn(update)
  }

  /**
   * Stops the driver. Does nothing if the driver is not running.
   */
  stop() {
    if (this._stopFn) {
      this._stopFn()
    }
    this._stopFn = undefined
  }

  /**
   * Create a new AnimationDriver using Window.requestAnimationFrame().
   */
  static rafDriver(): AnimationDriver {
    return new AnimationDriver((update) => {
      let lastRequestId = 0
      if (typeof window !== 'undefined') {
        const onAnimationFrame = (t: number) => {
          update(t)
          lastRequestId = window.requestAnimationFrame(onAnimationFrame)
        }
        lastRequestId = window.requestAnimationFrame(onAnimationFrame)
      } else {
        update(0)
        setTimeout(() => update(1), 0)
        console.log(
          `@theatre/dataverse is running in a server rather than in a browser. We haven't gotten around to testing server-side rendering, so if something is working in the browser but not on the server, please file a bug: https://github.com/theatre-js/theatre/issues/new`,
        )
      }
      return () => window.cancelAnimationFrame(lastRequestId)
    })
  }

  /**
   * Create a new AnimationDriver using XRSession.requestAnimationFrame().
   *
   * @param xrSession - The XRSession to use.
   */
  static xrRafDriver(xrSession: XRSession): AnimationDriver {
    return new AnimationDriver((update) => {
      let lastRequestId = 0
      const onAnimationFrame = (t: number) => {
        update(t)
        lastRequestId = xrSession.requestAnimationFrame(onAnimationFrame)
      }
      lastRequestId = xrSession.requestAnimationFrame(onAnimationFrame)
      return () => xrSession.cancelAnimationFrame(lastRequestId)
    })
  }
}

/**
 * The Ticker class helps schedule callbacks. Scheduled callbacks are executed per tick. Ticks can be triggered by an
 * external scheduling strategy, e.g. a raf.
 */
export default class Ticker {
  static get raf(): Ticker {
    if (!rafTicker) {
      rafTicker = new Ticker()
      rafTicker.applyDriver(AnimationDriver.rafDriver())
    }
    return rafTicker
  }
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _ticking: boolean = false
  private _driver: AnimationDriver | null = null

  constructor() {
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

  /**
   * Disposes of any previous driver and applies the given driver.
   *
   * @param driver - The driver to apply.
   */
  applyDriver(driver: AnimationDriver | null) {
    if (this._driver) {
      this._driver.stop()
    }
    this._driver = driver
    this._driver?.start(this.tick)
  }
}
