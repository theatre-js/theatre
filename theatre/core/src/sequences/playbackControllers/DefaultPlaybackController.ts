import type {
  IPlaybackDirection,
  IPlaybackRange,
} from '@theatre/core/sequences/Sequence'
import {defer} from '@theatre/shared/utils/defer'
import noop from '@theatre/shared/utils/noop'
import type {Pointer, Ticker} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'

export interface IPlaybackState {
  position: number
}

export interface IPlaybackController {
  playing: boolean
  getCurrentPosition(): number
  gotoPosition(position: number): void
  statePointer: Pointer<IPlaybackState>
  destroy(): void

  play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
  ): Promise<boolean>

  pause(): void
}

export default class DefaultPlaybackController implements IPlaybackController {
  playing: boolean = false
  _stopPlayCallback: () => void = noop
  private _state: Atom<IPlaybackState> = new Atom({position: 0})
  readonly statePointer: Pointer<IPlaybackState>
  constructor(private readonly _ticker: Ticker) {
    this.statePointer = this._state.pointer
  }

  destroy() {}

  pause() {
    this._stopPlayCallback()
    this.playing = false
    this._stopPlayCallback = noop
  }

  gotoPosition(time: number) {
    this._updatePositionInState(time)
  }

  private _updatePositionInState(time: number) {
    this._state.reduceState(['position'], () => time)
  }

  getCurrentPosition() {
    return this._state.getState().position
  }

  play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
  ): Promise<boolean> {
    if (this.playing) {
      this.pause()
    }

    this.playing = true

    const ticker = this._ticker
    let lastTickerTime = ticker.time
    const dur = range.end - range.start
    const prevTime = this.getCurrentPosition()

    if (prevTime < range.start || prevTime > range.end) {
      this._updatePositionInState(range.start)
    } else if (
      prevTime === range.end &&
      (direction === 'normal' || direction === 'alternate')
    ) {
      this._updatePositionInState(range.start)
    } else if (
      prevTime === range.start &&
      (direction === 'reverse' || direction === 'alternateReverse')
    ) {
      this._updatePositionInState(range.end)
    }

    let goingForward =
      direction === 'alternateReverse' || direction === 'reverse' ? -1 : 1

    let countSoFar = 1

    const deferred = defer<boolean>()

    const tick = (tickerTimeInMs: number) => {
      const tickerTime = tickerTimeInMs / 1000
      const lastTime = this.getCurrentPosition()
      const timeDiff = (tickerTime - lastTickerTime) * (rate * goingForward)
      lastTickerTime = tickerTime
      /*
       * I don't know why exactly this happens, but every 10 times or so, the first sequence.play({iterationCount: 1}),
       * the first call of tick() will have a timeDiff < 0.
       * This might be because of Spectre mitigation (they randomize performance.now() a bit), or it could be that
       * I'm using performance.now() the wrong way.
       * Anyway, this seems like a working fix for it:
       */
      if (timeDiff < 0) {
        requestNextTick()
        return
      }
      const newTime = lastTime + timeDiff

      if (newTime < range.start) {
        if (countSoFar === iterationCount) {
          this._updatePositionInState(range.start)
          this.playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (range.start - newTime) % dur
          if (direction === 'reverse') {
            this._updatePositionInState(range.end - diff)
          } else {
            goingForward = 1
            this._updatePositionInState(range.start + diff)
          }
          requestNextTick()
          return
        }
      } else if (newTime === range.end) {
        this._updatePositionInState(range.end)
        if (countSoFar === iterationCount) {
          this.playing = false
          deferred.resolve(true)
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.end) {
        if (countSoFar === iterationCount) {
          this._updatePositionInState(range.end)
          this.playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (newTime - range.end) % dur
          if (direction === 'normal') {
            this._updatePositionInState(range.start + diff)
          } else {
            goingForward = -1
            this._updatePositionInState(range.end - diff)
          }
          requestNextTick()
          return
        }
      } else {
        this._updatePositionInState(newTime)
        requestNextTick()
        return
      }
    }

    this._stopPlayCallback = () => {
      ticker.offThisOrNextTick(tick)
      ticker.offNextTick(tick)

      if (this.playing) deferred.resolve(false)
    }
    const requestNextTick = () => ticker.onNextTick(tick)
    ticker.onThisOrNextTick(tick)
    return deferred.promise
  }
}
