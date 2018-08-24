import Project from '$tl/Project/Project'
import InternalTimeline from './InternalTimeline'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import atom, {Atom} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import {TimelineInstanceAddress} from '$tl/handy/addresses'
import {noop} from 'redux-saga/utils'
import {VoidFn} from '$shared/types'

type State = {
  time: number
}

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

  gotoTime = (t: number) => {
    this._state.reduceState(
      ['time'],
      () => (typeof t === 'number' && t >= 0 ? t : 0),
    )
    
  }

  get time() {
    return this._state.getState().time
  }

  get playing() {
    return this._playing
  }

  play(conf: Partial<{repeat: boolean}>) {
    const repeat = conf ? !!conf.repeat : false
    if (this._playing) return
    this._playing = true
    // debugger

    const ticker = this._project.ticker
    let tickerTimeWhenStarted = ticker.time
    const playableRangeD = this._internalTimeline._getPlayableRangeD()
    const stopKeepingPlayableRangeHot = playableRangeD.keepHot()

    // const rangeToPlayInD =
    // if we're outside the playable range, put us inside the range
    let instnaceTimeWhenStarted =
      playableRangeD.getValue().start > this.time ||
      playableRangeD.getValue().end < this.time
        ? playableRangeD.getValue().start
        : this.time

    const tick: (t: number) => void = tickerTime => {
      if (!this._playing) {
        stopKeepingPlayableRangeHot()
        return
      }
      const {start, end} = playableRangeD.getValue()
      const dur = end - start
      const tickerTimeDiff = tickerTime - tickerTimeWhenStarted
      const targetTime = instnaceTimeWhenStarted + tickerTimeDiff
      
      if (targetTime < start) {
        this.gotoTime(0)
        instnaceTimeWhenStarted = 0
        tickerTimeWhenStarted = tickerTime
        requestNextTick()
        return
      } else if (targetTime >= end) {
        if (!repeat) {
          this.gotoTime(end)
          this._playing = false
          return
        } else {
          if (targetTime === end) {
            this.gotoTime(end)
            requestNextTick()
            return
          } else {
            const diffFromEnd = targetTime - end
            const newStart = diffFromEnd % dur
            this.gotoTime(newStart)
            tickerTimeWhenStarted = tickerTime
            instnaceTimeWhenStarted = newStart
            requestNextTick()
            return
          }
        }
      } else {
        this.gotoTime(targetTime)
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
