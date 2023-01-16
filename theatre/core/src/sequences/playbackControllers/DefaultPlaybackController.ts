import type {
  IPlaybackDirection,
  IPlaybackRange,
} from '@theatre/core/sequences/Sequence'
import {defer} from '@theatre/shared/utils/defer'
import noop from '@theatre/shared/utils/noop'
import type {Prism, Pointer, Ticker} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'

export interface IPlaybackState {
  position: number
  playing: boolean
}

export interface IPlaybackController {
  getCurrentPosition(): number
  gotoPosition(position: number): void
  readonly statePointer: Pointer<IPlaybackState>
  destroy(): void

  play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
    ticker: Ticker,
  ): Promise<boolean>

  /**
   * Controls the playback within a range. Repeats infinitely unless stopped.
   *
   * @remarks
   *   One use case for this is to play the playback within the focus range.
   *
   * @param rangeD - The prism that contains the range that will be used for the playback
   *
   * @returns  a promise that gets rejected if the playback stopped for whatever reason
   *
   */
  playDynamicRange(
    rangeD: Prism<IPlaybackRange>,
    ticker: Ticker,
  ): Promise<unknown>

  pause(): void
}

export default class DefaultPlaybackController implements IPlaybackController {
  _stopPlayCallback: () => void = noop
  private _state: Atom<IPlaybackState> = new Atom<IPlaybackState>({
    position: 0,
    playing: false,
  })
  readonly statePointer: Pointer<IPlaybackState>

  constructor() {
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
    this._state.setByPointer((p) => p.position, time)
  }

  getCurrentPosition() {
    return this._state.get().position
  }

  get playing() {
    return this._state.get().playing
  }

  set playing(playing: boolean) {
    this._state.setByPointer((p) => p.playing, playing)
  }

  play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
    ticker: Ticker,
  ): Promise<boolean> {
    if (this.playing) {
      this.pause()
    }

    this.playing = true

    const iterationLength = range[1] - range[0]

    {
      const startPos = this.getCurrentPosition()

      if (startPos < range[0] || startPos > range[1]) {
        if (direction === 'normal' || direction === 'alternate') {
          this._updatePositionInState(range[0])
        } else if (
          direction === 'reverse' ||
          direction === 'alternateReverse'
        ) {
          this._updatePositionInState(range[1])
        }
      } else if (direction === 'normal' || direction === 'alternate') {
        if (startPos === range[1]) {
          this._updatePositionInState(range[0])
        }
      } else {
        if (startPos === range[0]) {
          this._updatePositionInState(range[1])
        }
      }
    }

    const deferred = defer<boolean>()
    const initialTickerTime = ticker.time
    const totalPlaybackLength = iterationLength * iterationCount

    let initialElapsedPos = this.getCurrentPosition() - range[0]

    if (direction === 'reverse' || direction === 'alternateReverse') {
      initialElapsedPos = range[1] - this.getCurrentPosition()
    }

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
        const iterationNumber = Math.floor(elapsedPos / iterationLength)

        let currentIterationPos =
          ((elapsedPos / iterationLength) % 1) * iterationLength

        if (direction !== 'normal') {
          if (direction === 'reverse') {
            currentIterationPos = iterationLength - currentIterationPos
          } else {
            const isCurrentIterationNumberEven = iterationNumber % 2 === 0
            if (direction === 'alternate') {
              if (!isCurrentIterationNumberEven) {
                currentIterationPos = iterationLength - currentIterationPos
              }
            } else {
              if (isCurrentIterationNumberEven) {
                currentIterationPos = iterationLength - currentIterationPos
              }
            }
          }
        }

        this._updatePositionInState(currentIterationPos + range[0])
        requestNextTick()
      } else {
        if (direction === 'normal') {
          this._updatePositionInState(range[1])
        } else if (direction === 'reverse') {
          this._updatePositionInState(range[0])
        } else {
          const isLastIterationEven = (iterationCount - 1) % 2 === 0
          if (direction === 'alternate') {
            if (isLastIterationEven) {
              this._updatePositionInState(range[1])
            } else {
              this._updatePositionInState(range[0])
            }
          } else {
            if (isLastIterationEven) {
              this._updatePositionInState(range[0])
            } else {
              this._updatePositionInState(range[1])
            }
          }
        }
        this.playing = false
        deferred.resolve(true)
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

  playDynamicRange(
    rangeD: Prism<IPlaybackRange>,
    ticker: Ticker,
  ): Promise<unknown> {
    if (this.playing) {
      this.pause()
    }

    this.playing = true

    const deferred = defer<boolean>()

    // We're keeping the rangeD hot, so we can read from it on every tick without
    // causing unnecessary recalculations
    const untapFromRangeD = rangeD.keepHot()
    // We'll release our subscription once this promise resolves/rejects, for whatever reason
    deferred.promise.then(untapFromRangeD, untapFromRangeD)

    let lastTickerTime = ticker.time

    const tick = (currentTickerTime: number) => {
      const elapsedSinceLastTick = Math.max(
        currentTickerTime - lastTickerTime,
        0,
      )
      lastTickerTime = currentTickerTime
      const elapsedSinceLastTickInSeconds = elapsedSinceLastTick / 1000

      const lastPosition = this.getCurrentPosition()

      const range = rangeD.getValue()

      if (lastPosition < range[0] || lastPosition > range[1]) {
        this.gotoPosition(range[0])
      } else {
        let newPosition = lastPosition + elapsedSinceLastTickInSeconds
        if (newPosition > range[1]) {
          newPosition = range[0] + (newPosition - range[1])
        }
        this.gotoPosition(newPosition)
      }

      requestNextTick()
    }

    this._stopPlayCallback = () => {
      ticker.offThisOrNextTick(tick)
      ticker.offNextTick(tick)

      deferred.resolve(false)
    }
    const requestNextTick = () => ticker.onNextTick(tick)
    ticker.onThisOrNextTick(tick)
    return deferred.promise
  }
}
