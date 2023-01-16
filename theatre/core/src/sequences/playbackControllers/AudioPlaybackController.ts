import type {
  IPlaybackDirection,
  IPlaybackRange,
} from '@theatre/core/sequences/Sequence'
import {defer} from '@theatre/shared/utils/defer'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import noop from '@theatre/shared/utils/noop'
import type {Prism, Pointer, Ticker} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import type {
  IPlaybackController,
  IPlaybackState,
} from './DefaultPlaybackController'
import {notify} from '@theatre/shared/notify'

export default class AudioPlaybackController implements IPlaybackController {
  _mainGain: GainNode
  private _state: Atom<IPlaybackState> = new Atom<IPlaybackState>({
    position: 0,
    playing: false,
  })
  readonly statePointer: Pointer<IPlaybackState>
  _stopPlayCallback: () => void = noop

  constructor(
    private readonly _decodedBuffer: AudioBuffer,
    private readonly _audioContext: AudioContext,
    private readonly _nodeDestination: AudioNode,
  ) {
    this.statePointer = this._state.pointer

    this._mainGain = this._audioContext.createGain()
    this._mainGain.connect(this._nodeDestination)
  }

  playDynamicRange(
    rangeD: Prism<IPlaybackRange>,
    ticker: Ticker,
  ): Promise<unknown> {
    const deferred = defer<boolean>()
    if (this._playing) this.pause()

    this._playing = true

    let stop: undefined | (() => void) = undefined

    const play = () => {
      stop?.()
      stop = this._loopInRange(rangeD.getValue(), ticker).stop
    }

    // We're keeping the rangeD hot, so we can read from it on every tick without
    // causing unnecessary recalculations
    const untapFromRangeD = rangeD.onStale(play)
    play()

    this._stopPlayCallback = () => {
      stop?.()
      untapFromRangeD()
      deferred.resolve(false)
    }

    return deferred.promise
  }

  private _loopInRange(
    range: IPlaybackRange,
    ticker: Ticker,
  ): {stop: () => void} {
    const rate = 1
    let startPos = this.getCurrentPosition()
    const iterationLength = range[1] - range[0]

    if (startPos < range[0] || startPos > range[1]) {
      // if we're currently out of the range
      this._updatePositionInState(range[0])
    } else if (startPos === range[1]) {
      // if we're currently at the very end of the range
      this._updatePositionInState(range[0])
    }
    startPos = this.getCurrentPosition()

    const currentSource = this._audioContext.createBufferSource()
    currentSource.buffer = this._decodedBuffer
    currentSource.connect(this._mainGain)
    currentSource.playbackRate.value = rate

    currentSource.loop = true
    currentSource.loopStart = range[0]
    currentSource.loopEnd = range[1]

    const initialTickerTime = ticker.time
    let initialElapsedPos = startPos - range[0]

    currentSource.start(0, startPos)

    const tick = (currentTickerTime: number) => {
      const elapsedTickerTime = Math.max(
        currentTickerTime - initialTickerTime,
        0,
      )
      const elapsedTickerTimeInSeconds = elapsedTickerTime / 1000

      const elapsedPos = elapsedTickerTimeInSeconds * rate + initialElapsedPos

      let currentIterationPos =
        ((elapsedPos / iterationLength) % 1) * iterationLength

      this._updatePositionInState(currentIterationPos + range[0])
      requestNextTick()
    }

    const requestNextTick = () => ticker.onNextTick(tick)
    ticker.onThisOrNextTick(tick)

    const stop = () => {
      currentSource.stop()
      currentSource.disconnect()
      ticker.offThisOrNextTick(tick)
      ticker.offNextTick(tick)
    }

    return {stop}
  }

  private get _playing() {
    return this._state.get().playing
  }

  private set _playing(playing: boolean) {
    this._state.setByPointer((p) => p.playing, playing)
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
    this._state.reduce((s) => ({...s, position: time}))
  }

  getCurrentPosition() {
    return this._state.get().position
  }

  play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
    ticker: Ticker,
  ): Promise<boolean> {
    if (this._playing) {
      this.pause()
    }

    this._playing = true

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
      notify.warning(
        "Can't play sequences with audio more than 1000 times",
        `The sequence will still play, but only 1000 times. The \`iterationCount: ${iterationCount}\` provided to \`sequence.play()\`
is too high for a sequence with audio.

To fix this, either set \`iterationCount\` to a lower value, or remove the audio from the sequence.`,
        [
          {
            url: 'https://www.theatrejs.com/docs/latest/manual/audio',
            title: 'Using Audio',
          },
          {
            url: 'https://www.theatrejs.com/docs/latest/api/core#sequence.attachaudio',
            title: 'Audio API',
          },
        ],
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
