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
    const startPos = this.getCurrentPosition()
    const iterationLength = range.end - range.start

    if (direction !== 'normal') {
      throw new InvalidArgumentError(
        `Audio-controlled sequences can only be played in the "normal" direction. ` +
          `'${direction}' given.`,
      )
    }

    if (iterationCount !== 1) {
      throw new InvalidArgumentError(
        `Audio-controlled sequences can only have an iterationCount of 1 ` +
          `'${iterationCount}' given.`,
      )
    }

    if (startPos < range.start || startPos > range.end) {
      // if we're currently out of the range
      this._updatePositionInState(range.start)
    } else if (startPos === range.end) {
      // if we're currently at the very end of the range
      this._updatePositionInState(range.start)
    }

    const deferred = defer<boolean>()

    const currentSource = this._audioContext.createBufferSource()
    currentSource.buffer = this._decodedBuffer
    currentSource.connect(this._mainGain)
    currentSource.playbackRate.value = rate

    const audioStartTimeInSeconds = this._audioContext.currentTime
    const wait = 0
    const timeToRangeEnd = range.end - startPos

    currentSource.start(
      audioStartTimeInSeconds + wait,
      startPos - wait,
      wait + timeToRangeEnd,
    )
    const initialTickerTime = ticker.time
    let initialElapsedPos = this.getCurrentPosition() - range.start
    const totalPlaybackLength = iterationLength * iterationCount

    const tick = (currentTickerTime: number) => {
      const elapsedTickerTime = Math.max(
        currentTickerTime - initialTickerTime,
        0,
      )
      const elapsedTickerTimeInSeconds = elapsedTickerTime / 1000

      const elapsedPos = Math.min(
        elapsedTickerTimeInSeconds * rate + initialElapsedPos,
        totalPlaybackLength,
      )

      if (elapsedPos !== totalPlaybackLength) {
        let currentIterationPos =
          ((elapsedPos / iterationLength) % 1) * iterationLength

        this._updatePositionInState(currentIterationPos)
        requestNextTick()
      } else {
        this._updatePositionInState(range.end)
        this.playing = false
        cleanup()
        deferred.resolve(true)
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
