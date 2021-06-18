import type {
  IPlaybackDirection,
  IPlaybackRange,
} from '@theatre/core/sequences/Sequence'
import {defer} from '@theatre/shared/utils/defer'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import noop from '@theatre/shared/utils/noop'
import type {Pointer, Ticker} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import type {
  IPlaybackController,
  IPlaybackState,
} from './DefaultPlaybackController'

export default class AudioPlaybackController implements IPlaybackController {
  _mainGain: GainNode
  private _state: Atom<IPlaybackState> = new Atom({position: 0})
  readonly statePointer: Pointer<IPlaybackState>
  _stopPlayCallback: () => void = noop
  playing: boolean = false

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

    if (rate !== 1.0) {
      throw new InvalidArgumentError(
        `Audio-controlled sequences can only have a playbackRate of 1.0. ${rate} given.`,
      )
    }

    if (direction !== 'normal') {
      throw new InvalidArgumentError(
        `Audio-controlled sequences can only be played in the "normal" direction. ` +
          `'${direction}' given.`,
      )
    }

    if (prevTime < range.start || prevTime > range.end) {
      // if we're currently out of the range
      this._updatePositionInState(range.start)
    } else if (prevTime === range.end) {
      // if we're currently at the very end of the range
      this._updatePositionInState(range.start)
    }

    let countSoFar = 1

    const deferred = defer<boolean>()

    const currentSource = this._audioContext.createBufferSource()
    currentSource.buffer = this._decodedBuffer
    currentSource.connect(this._mainGain)
    const audioStartTimeInSeconds = this._audioContext.currentTime
    const wait = 0
    const timeToRangeEnd = range.end - prevTime

    if (iterationCount > 1) {
      currentSource.loop = true
      currentSource.loopStart = range.start
      currentSource.loopEnd = range.end
    }

    currentSource.start(
      audioStartTimeInSeconds + wait,
      prevTime - wait,
      iterationCount === 1 ? wait + timeToRangeEnd : undefined,
    )

    const tick = (tickerTime: number) => {
      const lastTime = this.getCurrentPosition()
      const timeDiff = (tickerTime - lastTickerTime) * rate
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
          cleanup()
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (range.start - newTime) % dur

          this._updatePositionInState(range.start + diff)
          requestNextTick()
          return
        }
      } else if (newTime === range.end) {
        this._updatePositionInState(range.end)
        if (countSoFar === iterationCount) {
          this.playing = false
          cleanup()
          deferred.resolve(true)
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.end) {
        if (countSoFar === iterationCount) {
          this._updatePositionInState(range.end)
          this.playing = false
          cleanup()
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (newTime - range.end) % dur
          this._updatePositionInState(range.start + diff)

          requestNextTick()
          return
        }
      } else {
        this._updatePositionInState(newTime)
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
      ticker.offThisOrNextTick(tick)
      ticker.offNextTick(tick)

      if (this.playing) deferred.resolve(false)
    }
    const requestNextTick = () => ticker.onNextTick(tick)
    ticker.onThisOrNextTick(tick)
    return deferred.promise
  }
}
