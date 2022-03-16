import type Project from '@theatre/core/projects/Project'
import coreTicker from '@theatre/core/coreTicker'
import type Sheet from '@theatre/core/sheets/Sheet'
import type {SequenceAddress} from '@theatre/shared/utils/addresses'
import didYouMean from '@theatre/shared/utils/didYouMean'
import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import type {IBox, IDerivation, Pointer} from '@theatre/dataverse'
import {pointer} from '@theatre/dataverse'
import {Box, prism, val, valueDerivation} from '@theatre/dataverse'
import {padStart} from 'lodash-es'
import type {
  IPlaybackController,
  IPlaybackState,
} from './playbackControllers/DefaultPlaybackController'
import DefaultPlaybackController from './playbackControllers/DefaultPlaybackController'
import TheatreSequence from './TheatreSequence'
import logger from '@theatre/shared/logger'
import type {ISequence} from '..'

export type IPlaybackRange = [from: number, to: number]

export type IPlaybackDirection =
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternateReverse'

const possibleDirections = [
  'normal',
  'reverse',
  'alternate',
  'alternateReverse',
]

export default class Sequence {
  public readonly address: SequenceAddress
  publicApi: TheatreSequence

  private _playbackControllerBox: IBox<IPlaybackController>
  private _statePointerDerivation: IDerivation<Pointer<IPlaybackState>>
  private _positionD: IDerivation<number>
  private _positionFormatterD: IDerivation<ISequencePositionFormatter>
  _playableRangeD: undefined | IDerivation<{start: number; end: number}>

  readonly pointer: ISequence['pointer'] = pointer({root: this, path: []})
  readonly $$isIdentityDerivationProvider = true

  constructor(
    readonly _project: Project,
    readonly _sheet: Sheet,
    readonly _lengthD: IDerivation<number>,
    readonly _subUnitsPerUnitD: IDerivation<number>,
    playbackController?: IPlaybackController,
  ) {
    this.address = {...this._sheet.address, sequenceName: 'default'}

    this.publicApi = new TheatreSequence(this)

    this._playbackControllerBox = new Box(
      playbackController ?? new DefaultPlaybackController(coreTicker),
    )

    this._statePointerDerivation = this._playbackControllerBox.derivation.map(
      (playbackController) => playbackController.statePointer,
    )

    this._positionD = this._statePointerDerivation.flatMap((statePointer) =>
      valueDerivation(statePointer.position),
    )

    this._positionFormatterD = this._subUnitsPerUnitD.map(
      (subUnitsPerUnit) => new TimeBasedPositionFormatter(subUnitsPerUnit),
    )
  }

  getIdentityDerivation(path: Array<string | number>): IDerivation<unknown> {
    if (path.length === 0) {
      return prism((): ISequence['pointer']['$$__pointer_type'] => ({
        length: val(this.pointer.length),
        playing: val(this.pointer.playing),
        position: val(this.pointer.position),
      }))
    }
    if (path.length > 1) {
      return prism(() => undefined)
    }
    const [prop] = path
    if (prop === 'length') {
      return this._lengthD
    } else if (prop === 'position') {
      return this._positionD
    } else if (prop === 'playing') {
      return prism(() => {
        return val(this._statePointerDerivation.getValue().playing)
      })
    } else {
      return prism(() => undefined)
    }
  }

  get positionFormatter(): ISequencePositionFormatter {
    return this._positionFormatterD.getValue()
  }

  get derivationToStatePointer() {
    return this._statePointerDerivation
  }

  get length() {
    return this._lengthD.getValue()
  }

  get positionDerivation() {
    return this._positionD
  }

  get position() {
    return this._playbackControllerBox.get().getCurrentPosition()
  }

  get subUnitsPerUnit(): number {
    return this._subUnitsPerUnitD.getValue()
  }

  get positionSnappedToGrid(): number {
    return this.closestGridPosition(this.position)
  }

  closestGridPosition = (posInUnitSpace: number): number => {
    const subUnitsPerUnit = this.subUnitsPerUnit
    const gridLength = 1 / subUnitsPerUnit

    return parseFloat(
      (Math.round(posInUnitSpace / gridLength) * gridLength).toFixed(3),
    )
  }

  set position(requestedPosition: number) {
    let position = requestedPosition
    this.pause()
    if (process.env.NODE_ENV !== 'production') {
      if (typeof position !== 'number') {
        logger.error(
          `value t in sequence.position = t must be a number. ${typeof position} given`,
        )
        position = 0
      }
      if (position < 0) {
        logger.error(
          `sequence.position must be a positive number. ${position} given`,
        )
        position = 0
      }
    }
    if (position > this.length) {
      position = this.length
    }
    const dur = this.length
    this._playbackControllerBox
      .get()
      .gotoPosition(position > dur ? dur : position)
  }

  getDurationCold() {
    return this._lengthD.getValue()
  }

  get playing() {
    return val(this._playbackControllerBox.get().statePointer.playing)
  }

  _makeRangeFromSequenceTemplate(): IDerivation<IPlaybackRange> {
    return prism(() => {
      return [0, val(this._lengthD)]
    })
  }

  // TODO: to simplify, rangeD should not have an undefined inside
  // which means, if there is no range, then the caller can just read the
  // length of the sequence, and give us a playbackrange based on that, ie. [0, sequence.length]
  playDynamicRange(rangeD: IDerivation<IPlaybackRange | undefined>): void {
    // we should just patch rangeD to playbackController.playDynamicRange()
    const updatePlayback = (): void => {
      const range = rangeD.getValue()

      if (range === undefined) return
      this._playbackControllerBox.get().playDynamicRange(1000, range)
    }

    rangeD.changesWithoutValues().tap(() => {
      updatePlayback()
    })

    updatePlayback()
  }

  async play(
    conf?: Partial<{
      iterationCount: number
      range: IPlaybackRange
      rate: number
      direction: IPlaybackDirection
    }>,
  ): Promise<boolean> {
    const sequenceDuration = this.length
    const range: IPlaybackRange =
      conf && conf.range ? conf.range : [0, sequenceDuration]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof range[0] !== 'number' || range[0] < 0) {
        throw new InvalidArgumentError(
          `Argument conf.range[0] in sequence.play(conf) must be a positive number. ${JSON.stringify(
            range[0],
          )} given.`,
        )
      }
      if (range[0] >= sequenceDuration) {
        throw new InvalidArgumentError(
          `Argument conf.range[0] in sequence.play(conf) cannot be longer than the duration of the sequence, which is ${sequenceDuration}s. ${JSON.stringify(
            range[0],
          )} given.`,
        )
      }
      if (typeof range[1] !== 'number' || range[1] <= 0) {
        throw new InvalidArgumentError(
          `Argument conf.range[1] in sequence.play(conf) must be a number larger than zero. ${JSON.stringify(
            range[1],
          )} given.`,
        )
      }

      if (range[1] > sequenceDuration) {
        logger.warn(
          `Argument conf.range[1] in sequence.play(conf) cannot be longer than the duration of the sequence, which is ${sequenceDuration}s. ${JSON.stringify(
            range[1],
          )} given.`,
        )
        range[1] = sequenceDuration
      }

      if (range[1] <= range[0]) {
        throw new InvalidArgumentError(
          `Argument conf.range[1] in sequence.play(conf) must be larger than conf.range[0]. ${JSON.stringify(
            range,
          )} given.`,
        )
      }
    }

    const iterationCount =
      conf && typeof conf.iterationCount === 'number' ? conf.iterationCount : 1
    if (process.env.NODE_ENV !== 'production') {
      if (
        !(Number.isInteger(iterationCount) && iterationCount > 0) &&
        iterationCount !== Infinity
      ) {
        throw new InvalidArgumentError(
          `Argument conf.iterationCount in sequence.play(conf) must be an integer larger than 0. ${JSON.stringify(
            iterationCount,
          )} given.`,
        )
      }
    }

    const rate = conf && typeof conf.rate !== 'undefined' ? conf.rate : 1

    if (process.env.NODE_ENV !== 'production') {
      if (typeof rate !== 'number' || rate === 0) {
        throw new InvalidArgumentError(
          `Argument conf.rate in sequence.play(conf) must be a number larger than 0. ${JSON.stringify(
            rate,
          )} given.`,
        )
      }

      if (rate < 0) {
        throw new InvalidArgumentError(
          `Argument conf.rate in sequence.play(conf) must be a number larger than 0. ${JSON.stringify(
            rate,
          )} given. If you want the animation to play backwards, try setting conf.direction to 'reverse' or 'alternateReverse'.`,
        )
      }
    }

    const direction = conf && conf.direction ? conf.direction : 'normal'

    if (process.env.NODE_ENV !== 'production') {
      if (possibleDirections.indexOf(direction) === -1) {
        throw new InvalidArgumentError(
          `Argument conf.direction in sequence.play(conf) must be one of ${JSON.stringify(
            possibleDirections,
          )}. ${JSON.stringify(direction)} given. ${didYouMean(
            direction,
            possibleDirections,
          )}`,
        )
      }
    }

    return await this._play(
      iterationCount,
      [range[0], range[1]],
      rate,
      direction,
    )
  }

  protected _play(
    iterationCount: number,
    range: IPlaybackRange,
    rate: number,
    direction: IPlaybackDirection,
  ): Promise<boolean> {
    return this._playbackControllerBox
      .get()
      .play(iterationCount, range, rate, direction)
  }

  pause() {
    this._playbackControllerBox.get().pause()
  }

  replacePlaybackController(playbackController: IPlaybackController) {
    this.pause()
    const oldController = this._playbackControllerBox.get()
    this._playbackControllerBox.set(playbackController)

    const time = oldController.getCurrentPosition()
    oldController.destroy()
    playbackController.gotoPosition(time)
  }
}

export interface ISequencePositionFormatter {
  formatSubUnitForGrid(posInUnitSpace: number): string
  formatFullUnitForGrid(posInUnitSpace: number): string
  formatForPlayhead(posInUnitSpace: number): string
  formatBasic(posInUnitSpace: number): string
}

class TimeBasedPositionFormatter implements ISequencePositionFormatter {
  constructor(private readonly _fps: number) {}
  formatSubUnitForGrid(posInUnitSpace: number): string {
    const subSecondPos = posInUnitSpace % 1
    const frame = 1 / this._fps

    const frames = Math.round(subSecondPos / frame)
    return frames + 'f'
  }

  formatFullUnitForGrid(posInUnitSpace: number): string {
    let p = posInUnitSpace

    let s = ''

    if (p >= hour) {
      const hours = Math.floor(p / hour)
      s += hours + 'h'
      p = p % hour
    }

    if (p >= minute) {
      const minutes = Math.floor(p / minute)
      s += minutes + 'm'
      p = p % minute
    }

    if (p >= second) {
      const seconds = Math.floor(p / second)
      s += seconds + 's'
      p = p % second
    }

    const frame = 1 / this._fps

    if (p >= frame) {
      const frames = Math.floor(p / frame)
      s += frames + 'f'
      p = p % frame
    }

    return s.length === 0 ? '0s' : s
  }

  formatForPlayhead(posInUnitSpace: number): string {
    let p = posInUnitSpace

    let s = ''

    if (p >= hour) {
      const hours = Math.floor(p / hour)
      s += padStart(hours.toString(), 2, '0') + 'h'
      p = p % hour
    }

    if (p >= minute) {
      const minutes = Math.floor(p / minute)
      s += padStart(minutes.toString(), 2, '0') + 'm'
      p = p % minute
    } else if (s.length > 0) {
      s += '00m'
    }

    if (p >= second) {
      const seconds = Math.floor(p / second)
      s += padStart(seconds.toString(), 2, '0') + 's'
      p = p % second
    } else {
      s += '00s'
    }

    const frameLength = 1 / this._fps

    if (p >= frameLength) {
      const frames = Math.round(p / frameLength)
      s += padStart(frames.toString(), 2, '0') + 'f'
      p = p % frameLength
    } else if (p / frameLength > 0.98) {
      const frames = 1
      s += padStart(frames.toString(), 2, '0') + 'f'
      p = p % frameLength
    } else {
      s += '00f'
    }

    return s.length === 0 ? '00s00f' : s
  }

  formatBasic(posInUnitSpace: number): string {
    return posInUnitSpace.toFixed(2) + 's'
  }
}

const second = 1
const minute = second * 60
const hour = minute * 60
