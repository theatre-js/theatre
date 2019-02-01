import Project from '$tl/Project/Project'
import TimelineTemplate from './TimelineTemplate'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'
import atom, {Atom, val} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'
import {TimelineInstanceAddress} from '$tl/handy/addresses'
import {VoidFn} from '$shared/types'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import didYouMean from '$shared/utils/didYouMean'
import noop from '$shared/utils/noop'
import TheatreJSTimelineInstance from '$tl/facades/TheatreJSTimelineInstance'
import {InvalidArgumentError} from '$tl/handy/errors'
import {defer} from '$shared/utils/defer'

type State = {
  time: number
}

export type PlaybackRange = {
  from: number
  to: number
}

export type PlaybackDirection =
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
  protected _state: Atom<State> = atom({time: 0})
  public statePointer: Pointer<State>
  protected _playing: boolean = false
  _repeat: boolean
  _stopPlayCallback: VoidFn = noop
  facade: TheatreJSTimelineInstance

  constructor(
    readonly _project: Project,
    protected readonly _path: string,
    public readonly _instanceId: string,
  ) {
    this._timelineTemplate = _project._getTimelineTemplate(_path)
    this.statePointer = this._state.pointer
    this._address = {
      ...this._timelineTemplate._address,
      timelineInstanceId: _instanceId,
    }
    this.facade = new TheatreJSTimelineInstance(this)
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

  _gotoTime = (t: number) => {
    this._state.reduceState(
      ['time'],
      () => (typeof t === 'number' && t >= 0 ? t : 0),
    )
  }

  get time() {
    return this._state.getState().time
  }

  set time(_time: number) {
    let time = _time
    this.pause()
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
    if (time > this._timelineTemplate.duration) {
      // console.error(
      //   `timeline.time cannot be larger than the timeline's duration. You can read the duration using timeline.duration.`,
      // )
      time = this._timelineTemplate.duration
    }
    const dur = this._timelineTemplate.duration
    this._gotoTime(time > dur ? dur : time)
  }

  get playing() {
    return this._playing
  }

  _makeRangeFromTimelineTemplate(): AbstractDerivation<PlaybackRange> {
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
      range: PlaybackRange
      rate: number
      direction: PlaybackDirection
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

    const iterationCount =
      conf && typeof conf.iterationCount === 'number' ? conf.iterationCount : 1

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

    const rate = conf && typeof conf.rate !== 'undefined' ? conf.rate : 1

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

    const direction = conf && conf.direction ? conf.direction : 'normal'
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

    return this._play(
      iterationCount,
      {from: range.from, to: range.to},
      rate,
      direction,
    )
  }

  _play(
    iterationCount: number,
    range: PlaybackRange,
    rate: number,
    direction: PlaybackDirection,
  ): Promise<boolean> {
    if (this._playing) {
      this.pause()
    }

    this._playing = true

    const ticker = this._project.ticker
    let lastTickerTime = ticker.time
    const dur = range.to - range.from

    if (this.time < range.from || this.time > range.to) {
      this._gotoTime(range.from)
    } else if (
      this.time === range.to &&
      (direction === 'normal' || direction === 'alternate')
    ) {
      this._gotoTime(range.from)
    } else if (
      this.time === range.from &&
      (direction === 'reverse' || direction === 'alternateReverse')
    ) {
      this._gotoTime(range.to)
    }

    let goingForward =
      direction === 'alternateReverse' || direction === 'reverse' ? -1 : 1

    let countSoFar = 1

    const deferred = defer<boolean>()

    const tick = (tickerTime: number) => {
      const lastTime = this.time
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
          this._gotoTime(range.from)
          this._playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (range.from - newTime) % dur
          if (direction === 'reverse') {
            this._gotoTime(range.to - diff)
          } else {
            goingForward = 1
            this._gotoTime(range.from + diff)
          }
          requestNextTick()
          return
        }
      } else if (newTime === range.to) {
        this._gotoTime(range.to)
        if (countSoFar === iterationCount) {
          this._playing = false
          deferred.resolve(true)
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.to) {
        if (countSoFar === iterationCount) {
          this._gotoTime(range.to)
          this._playing = false
          deferred.resolve(true)
          return
        } else {
          countSoFar++
          const diff = (newTime - range.to) % dur
          if (direction === 'normal') {
            this._gotoTime(range.from + diff)
          } else {
            goingForward = -1
            this._gotoTime(range.to - diff)
          }
          requestNextTick()
          return
        }
      } else {
        this._gotoTime(newTime)
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

  pause() {
    this._stopPlayCallback()
    this._playing = false
    this._stopPlayCallback = noop
  }
}
