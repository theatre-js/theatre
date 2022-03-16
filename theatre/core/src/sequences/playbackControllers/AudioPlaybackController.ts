import type {
  IPlaybackDirection,
  IPlaybackRange,
} from '@theatre/core/sequences/Sequence'
import {defer} from '@theatre/shared/utils/defer'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import noop from '@theatre/shared/utils/noop'
import type {IDerivation, Pointer, Ticker} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import type {
  IPlaybackController,
  IPlaybackState,
} from './DefaultPlaybackController'

export default class AudioPlaybackController implements IPlaybackController {
  _mainGain: GainNode
  private _state: Atom<IPlaybackState> = new Atom<IPlaybackState>({
    position: 0,
    playing: false,
  })
  readonly statePointer: Pointer<IPlaybackState>
  _stopPlayCallback: () => void = noop

  constructor(
    private readonly _ticker: Ticker,
    private readonly _decodedBuffer: AudioBuffer,
    private readonly _audioContext: AudioContext,
    private readonly _nodeDestination: AudioNode,
  ) {
    this.statePointer = this._state.pointer

    this._mainGain = this._audioContext.createGain()
    this._mainGain.connect(this._nodeDestination)
  }
  // TODO implement me
  playDynamicRange(rangeD: IDerivation<IPlaybackRange>): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  private get _playing() {
    return this._state.getState().playing
  }

  private set _playing(playing: boolean) {
    this._state.setIn(['playing'], playing)
  }

  destroy() {}

  pause() {
    this._stopPlayCallback()
    this._playing = false
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
    if (this._playing) {
      this.pause()
    }

    this._playing = true

    const ticker = this._ticker
    let startPos = this.getCurrentPosition()
    const iterationLength = range[1] - range[0]

    if (direction !== 'normal') {
      throw new InvalidArgumentError(
        `Audio-controlled sequences can only be played in the "normal" direction. ` +
          `'${direction}' given.`,
      )
    }

    if (startPos < range[0] || startPos > range[1]) {
      // if we're currently out of the range
      this._updatePositionInState(range[0])
    } else if (startPos === range[1]) {
      // if we're currently at the very end of the range
      this._updatePositionInState(range[0])
    }
    startPos = this.getCurrentPosition()

    const deferred = defer<boolean>()

    const currentSource = this._audioContext.createBufferSource()
    currentSource.buffer = this._decodedBuffer
    currentSource.connect(this._mainGain)
    currentSource.playbackRate.value = rate

    if (iterationCount > 1000) {
      console.warn(
        `Audio-controlled sequences cannot have an iterationCount larger than 1000. It has been clamped to 1000.`,
      )
      iterationCount = 1000
    }

    if (iterationCount > 1) {
      currentSource.loop = true
      currentSource.loopStart = range[0]
      currentSource.loopEnd = range[1]
    }

    const initialTickerTime = ticker.time
    let initialElapsedPos = startPos - range[0]
    const totalPlaybackLength = iterationLength * iterationCount

    currentSource.start(0, startPos, totalPlaybackLength - initialElapsedPos)

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

        this._updatePositionInState(currentIterationPos + range[0])
        requestNextTick()
      } else {
        this._updatePositionInState(range[1])
        this._playing = false
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

      if (this._playing) deferred.resolve(false)
    }
    const requestNextTick = () => ticker.onNextTick(tick)
    ticker.onThisOrNextTick(tick)
    return deferred.promise
  }
}
