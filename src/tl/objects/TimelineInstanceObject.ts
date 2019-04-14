import TimelineInstance from '$tl/timelines/TimelineInstance'
import ObjectTemplate from '$tl/objects/ObjectTemplate'
import {NativeObjectTypeConfig, NativeObjectType} from './objectTypes'
import {VoidFn} from '$shared/types'
import didYouMean from '$shared/utils/didYouMean'
import PropInstance from './PropInstance'
import {mapValues} from '$shared/utils'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import Project from '$tl/Project/Project'
import TheatreJSTimelineInstanceObject from '../facades/TheatreJSTimelineInstanceObject'
import {warningForWhenAdapterDotStartDoesntReturnFunction} from '$tl/facades/TheatreJSAdaptersManager'
import {val, coldVal} from '$shared/DataVerse/atom'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import constant from '$shared/DataVerse/derivations/constant'
import {
  skipFindingColdDerivations,
  endSkippingColdDerivations,
} from '../../shared/debug'

const dummyValuesD = constant(0).flatMap(v => ({}))

class Task {
  controller: TaskController
  private _requestedToStop = false
  private _stopRequestCallback: VoidFn | undefined = undefined
  private _stopped = false

  constructor() {
    this.controller = new TaskController(this)
  }

  get requestedToStop() {
    return this._requestedToStop
  }

  stop() {
    if (this._requestedToStop) return
    this._requestedToStop = true
    if (this._stopRequestCallback) {
      this._stopRequestCallback()
    }
  }

  onRequestStop(callback: VoidFn) {
    this._stopRequestCallback = callback
  }

  setAsStopped() {
    this._stopped = true
  }

  get stopped() {
    return this._stopped
  }
}

class TaskController {
  constructor(private readonly _task: Task) {}

  stop() {
    this._task.stop()
  }

  get stopped() {
    return this._task.stopped
  }
}

type Values = {[k: string]: $FixMe}
export type OnValuesChangeCallback = (values: Values, time: number) => void

export default class TimelineInstanceObject {
  _objectTemplate: ObjectTemplate
  _propInstances: {[propName: string]: PropInstance} = {}
  _project: Project
  facade: TheatreJSTimelineInstanceObject
  _shouldStartAdapter = false
  _adapterStopFunction: VoidFn | undefined = undefined
  _adapterTaskController: undefined | TaskController = undefined
  private _valuesD: AbstractDerivation<Record<string, number>>

  constructor(
    readonly _timelineInstance: TimelineInstance,
    readonly path: string,
    readonly nativeObject: $FixMe,
    readonly config: NativeObjectTypeConfig,
    type: NativeObjectType,
  ) {
    this._project = _timelineInstance._project
    this._objectTemplate = this._timelineInstance._timelineTemplate.getObjectTemplate(
      path,
      nativeObject,
      config,
      type,
    )

    this._startAdapter()

    this.facade = new TheatreJSTimelineInstanceObject(this)
    this._valuesD = dummyValuesD
  }

  private _stopAdapter() {
    if (this._adapterTaskController) {
      this._adapterTaskController.stop()
      this._adapterTaskController = undefined
    }
  }

  private _startAdapter() {
    const adapter = this._objectTemplate.adapter
    if (adapter && adapter.start) {
      const task = new Task()
      this._adapterTaskController = task.controller

      this._project.ready.then(() => {
        if (task.requestedToStop) {
          task.setAsStopped()
          return
        }

        const stopFn = adapter.start!(this.facade)
        if (!$env.tl.isCore) {
          if (typeof stopFn !== 'function') {
            console.warn(
              warningForWhenAdapterDotStartDoesntReturnFunction(adapter),
            )
          }
        }

        task.onRequestStop(() => {
          if (typeof stopFn === 'function') stopFn()
          task.setAsStopped()
        })
      })
    }
  }

  override(
    nativeObject: $FixMe,
    config: NativeObjectTypeConfig,
    type: NativeObjectType,
  ) {
    this._stopAdapter()
    const template = this._objectTemplate
    template.override(nativeObject, config, type)
    this._startAdapter()
  }

  getProp(name: string) {
    if (
      !$env.tl.isCore &&
      !this._objectTemplate.atom.getState().objectProps[name]
    ) {
      throw new Error(
        `Object '${this.path}' does not have a prop named ${JSON.stringify(
          name,
        )}. ${didYouMean(
          name,
          Object.keys(this._objectTemplate.atom.getState().objectProps),
        )}`,
      )
    }

    if (!this._propInstances[name]) {
      this._propInstances[name] = new PropInstance(this, name)
    }

    return this._propInstances[name]
  }

  private _getValuesDerivation() {
    if (this._valuesD === dummyValuesD) {
      this._valuesD = autoDerive(() => {
        const propTypes = val(this._objectTemplate.atom.pointer.objectProps)
        const props = mapValues(propTypes, (_, propName) => {
          return this.getProp(propName)
        })
        return props
      }).flatMap(props => {
        return autoDerive(() => {
          const values = mapValues(props, prop => {
            return prop.value
          })

          return values
        })
      })
    }
    return this._valuesD
  }

  onValuesChange(callback: OnValuesChangeCallback): VoidFn {
    const der = this._getValuesDerivation()

    /**
     * This is temporary.
     */
    let lastValues: Values

    const untap = der.changes(this._objectTemplate._project.ticker).tap(v => {
      if (lastValues && objectsAreShallowEqual(lastValues, v)) return
      lastValues = v
      callback(v, this._timelineInstance.time)
    })

    this._project.ticker.registerSideEffect(() => {
      const d = der.getValue()
      lastValues = d
      callback(d, this._timelineInstance.time)
    })

    return untap
  }

  get currentValues() {
    let val
    // currently doesn't support cold reads
    const untap = this._getValuesDerivation().tapImmediate(
      this._project.ticker,
      v => (val = v),
    )
    untap()
    return val
  }
}

const objectsAreShallowEqual = <T extends $IntentionalAny>(
  a: T,
  b: T,
): boolean => {
  const aKeys = Object.keys(a)
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  for (const key of bKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}
