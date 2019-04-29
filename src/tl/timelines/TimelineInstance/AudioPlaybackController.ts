import {IPlaybackController, IPlaybackState} from './DefaultPlaybackController'
import atom, {Atom} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import {defer} from '$shared/utils/defer'
import noop from '$shared/utils/noop'
import {InvalidArgumentError} from '$tl/handy/errors'
import {
  IPlaybackDirection,
  IPlaybackRange,
} from '$tl/timelines/TimelineInstance/TimelineInstance'
export default class AudioPlaybackController implements IPlaybackController {
  _mainGain: GainNode
  private _state: Atom<IPlaybackState> = atom({time: 0})
  readonly statePointer: Pointer<IPlaybackState>
  _stopPlayCallback: () => void = noop
  playing: boolean

  constructor(
    private readonly _ticker: Ticker,
    private readonly _decodedBuffer: AudioBuffer,
    private readonly _audioContext: AudioContext,
    private readonly _nodeDestination: AudioDestinationNode,
  ) {
    this.statePointer = this._state.pointer

    this._mainGain = this._audioContext.createGain()
    this._mainGain.connect(this._nodeDestination)
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

    if (rate !== 1.0) {
      throw new InvalidArgumentError(
        `Audio-controlled timelines can only have a playbackRate of 1.0. ${rate} given.`,
      )
    }

    if (direction !== 'normal') {
      throw new InvalidArgumentError(
        `Audio-controlled timelines can only be played in the "normal" direction. ` +
          `'${direction}' given.`,
      )
    }

    if (prevTime < range.from || prevTime > range.to) {
      // if we're currently out of the range
      this._updateTimeInState(range.from)
    } else if (prevTime === range.to) {
      // if we're currently at the very end of the range
      this._updateTimeInState(range.from)
    }

    let countSoFar = 1

    const deferred = defer<boolean>()

    const currentSource = this._audioContext.createBufferSource()
    currentSource.buffer = this._decodedBuffer
    currentSource.connect(this._mainGain)
    const audioStartTimeInSeconds = this._audioContext.currentTime
    const wait = 0
    const timeToRangeEnd = (range.to - prevTime) / 1000.0

    if (iterationCount > 1) {
      currentSource.loop = true
      currentSource.loopStart = range.from / 1000.0
      currentSource.loopEnd = range.to / 1000.0
    }

    currentSource.start(
      audioStartTimeInSeconds + wait,
      prevTime / 1000.0 - wait,
      iterationCount === 1 ? wait + timeToRangeEnd : undefined,
    )

    const tick = (tickerTime: number) => {
      const lastTime = this.getCurrentTime()
      let timeDiff = (tickerTime - lastTickerTime) * rate
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
          cleanup()
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (range.from - newTime) % dur

          this._updateTimeInState(range.from + diff)
          requestNextTick()
          return
        }
      } else if (newTime === range.to) {
        this._updateTimeInState(range.to)
        if (countSoFar === iterationCount) {
          this.playing = false
          cleanup()
          deferred.resolve(true)
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.to) {
        if (countSoFar === iterationCount) {
          this._updateTimeInState(range.to)
          this.playing = false
          cleanup()
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (newTime - range.to) % dur
          this._updateTimeInState(range.from + diff)

          requestNextTick()
          return
        }
      } else {
        this._updateTimeInState(newTime)
        requestNextTick()
        return
      }
    }

    const cleanup = () => {
      currentSource.stop()
      currentSource.disconnect()
    }

    this._stopPlayCallback = () => {
      cleanup()
      ticker.unregisterSideEffect(tick)
      ticker.unregisterSideEffectForNextTick(tick)

      if (this.playing) deferred.resolve(false)
    }
    const requestNextTick = () => ticker.registerSideEffectForNextTick(tick)
    ticker.registerSideEffect(tick)
    return deferred.promise
  }
}
