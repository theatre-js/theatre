import Project from '$tl/Project/Project'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'
import {val, Atom} from '$shared/DataVerse/atom'
import {TimelineInstanceAddress} from '$tl/handy/addresses'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import didYouMean from '$shared/utils/didYouMean'
import TimelineFacade from '$tl/facades/TheatreTimeline'
import {InvalidArgumentError} from '$tl/handy/errors'
import DefaultPlaybackController, {
  IPlaybackController,
  IPlaybackState,
} from './DefaultPlaybackController'
import {IBox, box} from '$shared/DataVerse/box'
import {Pointer} from '$shared/DataVerse/pointer'
import {valueDerivation} from '../../../shared/DataVerse/atom'

export type IPlaybackRange = {
  from: number
  to: number
}

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

export default class TimelineInstance {
  _timelineTemplate: TimelineTemplate
  _objects: {[path: string]: TimelineInstanceObject} = {}
  _address: TimelineInstanceAddress
  facade: TimelineFacade
  private _playbackControllerBox: IBox<IPlaybackController>
  private _statePointerDerivation: AbstractDerivation<Pointer<IPlaybackState>>
  private _timeDerivation: AbstractDerivation<number>

  constructor(
    readonly _project: Project,
    protected readonly _path: string,
    public readonly _instanceId: string,
    playbackController?: IPlaybackController,
  ) {
    this._playbackControllerBox = box(
      playbackController || new DefaultPlaybackController(this._project.ticker),
    )

    this._timelineTemplate = _project._getTimelineTemplate(_path)
    this._address = {
      ...this._timelineTemplate._address,
      timelineInstanceId: _instanceId,
    }
    this.facade = new TimelineFacade(this)

    this._statePointerDerivation = this._playbackControllerBox.derivation.map(
      playbackController => playbackController.statePointer,
    )
    this._timeDerivation = this._statePointerDerivation.flatMap(statePointer =>
      valueDerivation(statePointer.time),
    )
  }

  get derivationToStatePointer() {
    return this._statePointerDerivation
  }

  get timeDerivation() {
    return this._timeDerivation
  }

  createObject(
    path: string,
    nativeObject: $FixMe,
    config: NativeObjectTypeConfig,
    type: NativeObjectType,
  ): TimelineInstanceObject {
    const object = (this._objects[path] = new TimelineInstanceObject(
      this,
      path,
      nativeObject,
      config,
      type,
    ))

    return object
  }

  getObject(path: string): TimelineInstanceObject {
    return this._objects[path]
  }

  get time() {
    return this._playbackControllerBox.get().getCurrentTime()
  }

  set time(requestedTime: number) {
    let time = requestedTime
    this.pause()
    if (!$env.tl.isCore) {
      if (typeof time !== 'number') {
        console.error(
          `value t in timeline.time = t must be a number. ${typeof time} given`,
        )
        time = 0
      }
      if (time < 0) {
        console.error(`timeline.time must be a positive number. ${time} given`)
        time = 0
      }
    }
    if (time > this._timelineTemplate.duration) {
      time = this._timelineTemplate.duration
    }
    const dur = this._timelineTemplate.duration
    this._playbackControllerBox.get().gotoTime(time > dur ? dur : time)
  }

  get playing() {
    return this._playbackControllerBox.get().playing
  }

  _makeRangeFromTimelineTemplate(): AbstractDerivation<IPlaybackRange> {
    return autoDerive(() => {
      return {
        from: 0,
        to: val(this._timelineTemplate._durationD),
      }
    })
  }

  play(
    conf?: Partial<{
      iterationCount: number
      range: IPlaybackRange
      rate: number
      direction: IPlaybackDirection
    }>,
  ) {
    const timelineDuration = this._timelineTemplate.duration
    const range =
      conf && conf.range
        ? conf.range
        : {
            from: 0,
            to: timelineDuration,
          }

    if (!$env.tl.isCore) {
      if (typeof range.from !== 'number' || range.from < 0) {
        throw new InvalidArgumentError(
          `Argument conf.range.from in timeline.play(conf) must be a positive number. ${JSON.stringify(
            range.from,
          )} given.`,
        )
      }
      if (range.from >= timelineDuration) {
        throw new InvalidArgumentError(
          `Argument conf.range.from in timeline.play(conf) cannot be longer than the duration of the timeline, which is ${timelineDuration}ms. ${JSON.stringify(
            range.from,
          )} given.`,
        )
      }
      if (typeof range.to !== 'number' || range.to <= 0) {
        throw new InvalidArgumentError(
          `Argument conf.range.to in timeline.play(conf) must be a number larger than zero. ${JSON.stringify(
            range.to,
          )} given.`,
        )
      }

      if (range.to > timelineDuration) {
        console.warn(
          `Argument conf.range.to in timeline.play(conf) cannot be longer than the duration of the timeline, which is ${timelineDuration}ms. ${JSON.stringify(
            range.to,
          )} given.`,
        )
        range.to = timelineDuration
      }

      if (range.to <= range.from) {
        throw new InvalidArgumentError(
          `Argument conf.range.to in timeline.play(conf) must be larger than conf.range.from. ${JSON.stringify(
            range,
          )} given.`,
        )
      }
    }

    const iterationCount =
      conf && typeof conf.iterationCount === 'number' ? conf.iterationCount : 1
    if (!$env.tl.isCore) {
      if (
        !(Number.isInteger(iterationCount) && iterationCount > 0) &&
        iterationCount !== Infinity
      ) {
        throw new InvalidArgumentError(
          `Argument conf.iterationCount in timeline.play(conf) must be an integer larger than 0. ${JSON.stringify(
            iterationCount,
          )} given.`,
        )
      }
    }

    const rate = conf && typeof conf.rate !== 'undefined' ? conf.rate : 1

    if (!$env.tl.isCore) {
      if (typeof rate !== 'number' || rate === 0) {
        throw new InvalidArgumentError(
          `Argument conf.rate in timeline.play(conf) must be a number larger than 0. ${JSON.stringify(
            rate,
          )} given.`,
        )
      }

      if (rate < 0) {
        throw new InvalidArgumentError(
          `Argument conf.rate in timeline.play(conf) must be a number larger than 0. ${JSON.stringify(
            rate,
          )} given. If you want the animation to play backwards, try setting conf.direction to 'reverse' or 'alternateReverse'.`,
        )
      }
    }

    const direction = conf && conf.direction ? conf.direction : 'normal'

    if (!$env.tl.isCore) {
      if (possibleDirections.indexOf(direction) === -1) {
        throw new InvalidArgumentError(
          `Argument conf.direction in timeline.play(conf) must be one of ${JSON.stringify(
            possibleDirections,
          )}. ${JSON.stringify(direction)} given. ${didYouMean(
            direction,
            possibleDirections,
          )}`,
        )
      }
    }

    return this._play(
      iterationCount,
      {from: range.from, to: range.to},
      rate,
      direction,
    )
  }

  _play(
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

    const time = oldController.getCurrentTime()
    oldController.destroy()
    playbackController.gotoTime(time)
  }
}
