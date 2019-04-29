import atom, {Atom} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import noop from '$shared/utils/noop'
import {
  IPlaybackRange,
  IPlaybackDirection,
} from '$tl/timelines/TimelineInstance/TimelineInstance'
import {defer} from '$shared/utils/defer'

// interface IPlayback {
//   donePromise: Promise<'interrupted' | 'finished'>
//   done: boolean
// }

export interface IPlaybackState {
  time: number
}

export interface IPlaybackController {
  playing: boolean
  getCurrentTime(): number
  gotoTime(time: number): void
  statePointer: Pointer<IPlaybackState>
  destroy(): void

  // play(
  //   iterationCount: number,
  //   range: IPlaybackRange,
  //   rate: number,
  //   direction: IPlaybackDirection,
  // ): IPlayback

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
  private _state: Atom<IPlaybackState> = atom({time: 0})
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

  gotoTime(time: number) {
    this._updateTimeInState(time)
  }

  private _updateTimeInState(time: number) {
    this._state.reduceState(['time'], () => time)
  }

  getCurrentTime() {
    return this._state.getState().time
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
    const dur = range.to - range.from
    const prevTime = this.getCurrentTime()

    if (prevTime < range.from || prevTime > range.to) {
      this._updateTimeInState(range.from)
    } else if (
      prevTime === range.to &&
      (direction === 'normal' || direction === 'alternate')
    ) {
      this._updateTimeInState(range.from)
    } else if (
      prevTime === range.from &&
      (direction === 'reverse' || direction === 'alternateReverse')
    ) {
      this._updateTimeInState(range.to)
    }

    let goingForward =
      direction === 'alternateReverse' || direction === 'reverse' ? -1 : 1

    let countSoFar = 1

    const deferred = defer<boolean>()

    const tick = (tickerTime: number) => {
      const lastTime = this.getCurrentTime()
      let timeDiff = (tickerTime - lastTickerTime) * (rate * goingForward)
      lastTickerTime = tickerTime
      // I don't know why exactly this happens, but every 10 times or so, the first timeline.play({iterationCount: 1}),
      // the first call of tick() will have a timeDiff < 0.
      // This might be because of Spectre mitigation (they randomize performance.now() a bit), or it could be that
      // I'm using performance.now() the wrong way.
      // Anyway, this seems like a working fix for it:
      if (timeDiff < 0) {
        requestNextTick()
        return
      }
      const newTime = lastTime + timeDiff

      if (newTime < range.from) {
        if (countSoFar === iterationCount) {
          this._updateTimeInState(range.from)
          this.playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (range.from - newTime) % dur
          if (direction === 'reverse') {
            this._updateTimeInState(range.to - diff)
          } else {
            goingForward = 1
            this._updateTimeInState(range.from + diff)
          }
          requestNextTick()
          return
        }
      } else if (newTime === range.to) {
        this._updateTimeInState(range.to)
        if (countSoFar === iterationCount) {
          this.playing = false
          deferred.resolve(true)
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.to) {
        if (countSoFar === iterationCount) {
          this._updateTimeInState(range.to)
          this.playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (newTime - range.to) % dur
          if (direction === 'normal') {
            this._updateTimeInState(range.from + diff)
          } else {
            goingForward = -1
            this._updateTimeInState(range.to - diff)
          }
          requestNextTick()
          return
        }
      } else {
        this._updateTimeInState(newTime)
        requestNextTick()
        return
      }
    }

    this._stopPlayCallback = () => {
      ticker.unregisterSideEffect(tick)
      ticker.unregisterSideEffectForNextTick(tick)

      if (this.playing) deferred.resolve(false)
    }
    const requestNextTick = () => ticker.registerSideEffectForNextTick(tick)
    ticker.registerSideEffect(tick)
    return deferred.promise
  }
}
