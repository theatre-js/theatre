import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from './objectTypes'
import {VoidFn} from '$shared/types'
import didYouMean from '$shared/utils/didYouMean'
import PropInstance from './PropInstance'
import {mapValues} from 'lodash-es'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import Project from '$tl/Project/Project'

type Values = {[k: string]: $FixMe}

export default class TimelineInstanceObject {
  _internalObject: InternalObject
  _propInstances: {[propName: string]: PropInstance} = {}
  _project: Project
  constructor(
    readonly _timelineInstance: TimelineInstance,
    readonly path: string,
    readonly nativeObject: $FixMe,
    readonly config: NativeObjectTypeConfig | undefined,
  ) {
    this._project = _timelineInstance._project
    this._internalObject = this._timelineInstance._internalTimeline.getInternalObject(
      path,
      nativeObject,
      config,
    )

    const adapter = this._internalObject.adapter
    if (adapter && adapter.start) {
      adapter.start!(this, nativeObject, config)
    }
  }

  getProp(name: string) {
    if (!this._internalObject.nativeObjectType.props[name]) {
      throw new Error(
        `Object '${this.path}' does not have a prop named ${JSON.stringify(
          name,
        )}. ${didYouMean(
          name,
          Object.keys(this._internalObject.nativeObjectType.props),
        )}`,
      )
    }

    if (!this._propInstances[name]) {
      this._propInstances[name] = new PropInstance(this, name)
    }

    return this._propInstances[name]
  }

  onValuesChange(callback: (values: Values, time: number) => void): VoidFn {
    const props = mapValues(
      this._internalObject.nativeObjectType.props,
      (_, propName) => {
        return this.getProp(propName)
      },
    )

    const der = autoDerive(() => {
      const values = mapValues(props, prop => {
        return prop.value
      })

      return values
    })

    const untap = der.changes(this._internalObject._project.ticker).tap(v => {
      callback(v, this._timelineInstance.time)
    })

    this._project.ticker.registerSideEffect(() => {
      callback(der.getValue(), this._timelineInstance.time)
    })

    return untap
  }
}
