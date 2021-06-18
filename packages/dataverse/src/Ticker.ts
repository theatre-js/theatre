type ICallback = (t: number) => void

export default class Ticker {
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _ticking: boolean = false

  constructor() {
    this._scheduledForThisOrNextTick = new Set()
    this._scheduledForNextTick = new Set()
    this._timeAtCurrentTick = 0
  }

  /**
   * Registers for fn to be called either on this tick or the next tick.
   *
   * If registerSideEffect() is called while Ticker.tick() is running, the
   * side effect _will_ be called within the running tick. If you don't want this
   * behavior, you can use registerSideEffectForNextTick().
   *
   * Note that fn will be added to a Set(). Which means, if you call registerSideEffect(fn)
   * with the same fn twice in a single tick, it'll only run once.
   */
  onThisOrNextTick(fn: ICallback) {
    this._scheduledForThisOrNextTick.add(fn)
  }

  /**
   * Registers a side effect to be called on the next tick.
   *
   * @see Ticker:onThisOrNextTick()
   */
  onNextTick(fn: ICallback) {
    this._scheduledForNextTick.add(fn)
  }

  offThisOrNextTick(fn: ICallback) {
    this._scheduledForThisOrNextTick.delete(fn)
  }

  offNextTick(fn: ICallback) {
    this._scheduledForNextTick.delete(fn)
  }

  get time() {
    if (this._ticking) {
      return this._timeAtCurrentTick
    } else return performance.now()
  }

  tick(t: number = performance.now()) {
    this._ticking = true
    this._timeAtCurrentTick = t
    this._scheduledForNextTick.forEach((v) =>
      this._scheduledForThisOrNextTick.add(v),
    )
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
    oldSet.forEach((fn) => {
      fn(time)
    })

    if (this._scheduledForThisOrNextTick.size > 0) {
      return this._tick(iterationNumber + 1)
    }
  }
}
