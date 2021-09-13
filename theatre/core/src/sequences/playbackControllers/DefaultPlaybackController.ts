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
    const iterationLength = range[1] - range[0]

    {
      const startPos = this.getCurrentPosition()

      if (startPos < range[0] || startPos > range[1]) {
        this._updatePositionInState(range[0])
      } else if (
        startPos === range[1] &&
        (direction === 'normal' || direction === 'alternate')
      ) {
        this._updatePositionInState(range[0])
      } else if (
        startPos === range[0] &&
        (direction === 'reverse' || direction === 'alternateReverse')
      ) {
        this._updatePositionInState(range[1])
      }
    }

    const deferred = defer<boolean>()
    const initialTickerTime = ticker.time
    const totalPlaybackLength = iterationLength * iterationCount
    let initialElapsedPos = this.getCurrentPosition() - range[0]
    if (direction === 'reverse' || direction === 'alternateReverse') {
      initialElapsedPos = range[1] - initialElapsedPos
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

        this._updatePositionInState(currentIterationPos)
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
}
