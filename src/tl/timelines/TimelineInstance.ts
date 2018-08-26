import Project from '$tl/Project/Project'
import InternalTimeline from './InternalTimeline'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import atom, {Atom, val, coldVal} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import {TimelineInstanceAddress} from '$tl/handy/addresses'
import {noop} from 'redux-saga/utils'
import {VoidFn} from '$shared/types'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import didYouMean from '$shared/utils/didYouMean'

type State = {
  time: number
}

type Range = {
  from: number
  to: number
}

enum Direction {
  Normal = 'normal',
  Reverse = 'reverse',
  Alternate = 'alternate',
  AlternateReverse = 'alternateReverse',
}

const possibleDirections = [
  Direction.Normal,
  Direction.Reverse,
  Direction.Alternate,
  Direction.AlternateReverse,
]

export default class TimelineInstance {
  _internalTimeline: InternalTimeline
  _objects: {[path: string]: TimelineInstanceObject} = {}
  _address: TimelineInstanceAddress
  protected _state: Atom<State> = atom({time: 0})
  public statePointer: Pointer<State>
  protected _playing: boolean = false
  _repeat: boolean
  _stopPlayCallback: VoidFn = noop

  constructor(
    readonly _project: Project,
    protected readonly _path: string,
    public readonly _instanceId: string,
  ) {
    this._internalTimeline = _project._getInternalTimeline(_path)
    this.statePointer = this._state.pointer
    this._address = {
      ...this._internalTimeline._address,
      timelineInstanceId: _instanceId,
    }
  }

  createObject(
    _path: string,
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
  ): TimelineInstanceObject {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'timeline.createObject',
    )

    let object = this._objects[path]
    if (!object) {
      object = this._objects[path] = new TimelineInstanceObject(
        this,
        path,
        nativeObject,
        config,
      )
    } else {
      if (nativeObject !== object.nativeObject) {
        throw new Error(
          `Looks like you're creating two different objects on the same path "${path}".
          If you're trying to create two different objects, give each a unique path.
          Otherwise if you're trying to query the same existing object, you can run
          timeline.getObject(path) to get access to that object after it's been created.`,
        )
      }
    }

    return object
  }

  getObject(_path: string): TimelineInstanceObject | undefined {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'timeline.getObject',
    )

    return this._objects[path]
  }

  _gotoTime = (t: number) => {
    this._state.reduceState(
      ['time'],
      () => (typeof t === 'number' && t >= 0 ? t : 0),
    )
  }

  gotoTime = (time: number) => {
    console.warn(`TimelineInstance.gotoTime(t) is deprecated. Use 'TimelineInstance.time = t' instead.`)
    this.time = time
  }

  get time() {
    return this._state.getState().time
  }

  set time(time: number) {
    this.pause()
    if (typeof time !== 'number') {
      throw new Error(`timeline.time must be a number`)
    }
    if (time < 0) {
      throw new Error(
        `timeline.time must be a positive number`,
      )
    }
    const dur = coldVal(this._internalTimeline.pointerToRangeState.duration)
    this._gotoTime(time > dur ? dur : time)
  }

  get playing() {
    return this._playing
  }

  _makeRangeFromInternalTimeline(): AbstractDerivation<Range> {
    return autoDerive(() => {
      return {
        from: 0,
        to: val(this._internalTimeline.pointerToRangeState.duration),
      }
    })
  }

  play(
    conf?: Partial<{
      iterationCount: number
      range: Range
      rate: number
      direction: Direction
    }>,
  ) {
    const timelineDuration = coldVal(
      this._internalTimeline.pointerToRangeState.duration,
    )
    const range =
      conf && conf.range
        ? conf.range
        : {
            from: 0,
            to: timelineDuration,
          }

    if (typeof range.from !== 'number' || range.from < 0) {
      throw new Error(
        `Argument conf.range.from in play(conf) must be a positive number. ${JSON.stringify(
          range.from,
        )} given.`,
      )
    }
    if (range.from >= timelineDuration) {
      throw new Error(
        `Argument conf.range.from in play(conf) cannot be longer than the duration of the timeline, which is ${timelineDuration}ms. ${JSON.stringify(
          range.from,
        )} given.`,
      )
    }
    if (typeof range.to !== 'number' || range.to <= 0) {
      throw new Error(
        `Argument conf.range.to in play(conf) must be a number larger than zero. ${JSON.stringify(
          range.to,
        )} given.`,
      )
    }
    if (range.from > timelineDuration) {
      throw new Error(
        `Argument conf.range.to in play(conf) cannot be longer than the duration of the timeline, which is ${timelineDuration}ms. ${JSON.stringify(
          range.to,
        )} given.`,
      )
    }
    if (range.to <= range.from) {
      throw new Error(
        `Argument conf.range.to in play(conf) must be larger than conf.range.from. ${JSON.stringify(
          range,
        )} given.`,
      )
    }

    const iterationCount =
      conf && typeof conf.iterationCount === 'number' ? conf.iterationCount : 1

    if (!(Number.isInteger(iterationCount) && iterationCount > 0)) {
      throw new Error(
        `Argument conf.iterationCount in play(conf) must be an integer larger than 0. ${JSON.stringify(
          iterationCount,
        )} given.`,
      )
    }

    const rate = conf && typeof conf.rate !== 'undefined' ? conf.rate : 1

    if (typeof rate !== 'number' || rate === 0) {
      throw new Error(
        `Argument conf.rate in play(conf) must be a number larger than 0. ${JSON.stringify(
          rate,
        )} given.`,
      )
    }

    if (rate < 0) {
      throw new Error(
        `Argument conf.rate in play(conf) must be a number larger than 0. ${JSON.stringify(
          rate,
        )} given. If you want the animation to play backwards, try setting conf.direction to '${
          Direction.Reverse
        }' or '${Direction.AlternateReverse}'.`,
      )
    }

    const direction = conf && conf.direction ? conf.direction : Direction.Normal
    if (possibleDirections.indexOf(direction) === -1) {
      throw new Error(
        `Argument conf.direction in play(conf) must be one of ${JSON.stringify(
          possibleDirections,
        )}. ${JSON.stringify(direction)} given. ${didYouMean(
          direction,
          possibleDirections,
        )}`,
      )
    }

    this._play(iterationCount, range, rate, direction)
  }

  _play(iterationCount: number, range: Range, rate: number, direction: Direction) {
    if (this._playing) {
      this.pause()
    }

    this._playing = true

    const ticker = this._project.ticker
    let lastTickerTime = ticker.time
    const dur = range.to - range.from

    if (this.time < range.from || this.time > range.to) {
      this._gotoTime(range.from)
    }

    let goingForward =
      direction === Direction.AlternateReverse || direction === Direction.Reverse ? -1 : 1

    let countSoFar = 1

    const tick = (tickerTime: number) => {
      const lastTime = this.time
      const timeDiff = (tickerTime - lastTickerTime) * (rate * goingForward)
      lastTickerTime = tickerTime
      const newTime = lastTime + timeDiff

      if (newTime < range.from) {
        if (countSoFar === iterationCount) {
          this._gotoTime(range.from)
          this._playing = false
          return
        } else {
          countSoFar++
          const diff = (range.from - newTime) % dur
          if (direction === Direction.Reverse) {
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
          return
        }
        requestNextTick()
        return
      } else if (newTime > range.to) {
        if (countSoFar === iterationCount) {
          this._gotoTime(range.to)
          this._playing = false
          return
        } else {
          countSoFar++
          const diff = (newTime - range.to) % dur
          if (direction === Direction.Normal) {
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
    }
    const requestNextTick = () => ticker.registerSideEffectForNextTick(tick)
    ticker.registerSideEffect(tick)
  }

  pause() {
    this._playing = false
    this._stopPlayCallback()
    this._stopPlayCallback = noop
  }
}
