type ICallback = (t: number) => void

export default class Freshener {
  private _scheduledForThisOrNextTick: Set<ICallback>
  private _scheduledForNextTick: Set<ICallback>
  private _timeAtCurrentTick: number
  private _freshening: boolean = false

  constructor() {
    this._scheduledForThisOrNextTick = new Set()
    this._scheduledForNextTick = new Set()
    this._timeAtCurrentTick = 0
  }

  /**
   * Registers for fn to be called either on this freshen or the next freshen.
   *
   * If registerSideEffect() is called while Freshener.freshen() is running, the
   * side effect _will_ be called within the running freshen. If you don't want this
   * behavior, you can use registerSideEffectForNextTick().
   *
   * Note that fn will be added to a Set(). Which means, if you call registerSideEffect(fn)
   * with the same fn twice in a single freshen, it'll only run once.
   */
  onThisOrNextTick(fn: ICallback) {
    this._scheduledForThisOrNextTick.add(fn)
  }

  /**
   * Registers a side effect to be called on the next freshen.
   *
   * @see Freshener:onThisOrNextTick()
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
    if (this._freshening) {
      return this._timeAtCurrentTick
    } else return performance.now()
  }

  freshen(t: number = performance.now()) {
    this._freshening = true
    this._timeAtCurrentTick = t
    this._scheduledForNextTick.forEach((v) =>
      this._scheduledForThisOrNextTick.add(v),
    )
    this._scheduledForNextTick.clear()
    this._freshen(0)
    this._freshening = false
  }

  private _freshen(iterationNumber: number): void {
    const time = this.time

    if (iterationNumber > 10) {
      console.warn('_freshen() recursing for 10 times')
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
      return this._freshen(iterationNumber + 1)
    }
  }
}
