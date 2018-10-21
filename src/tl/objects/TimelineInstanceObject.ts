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

type Values = {[k: string]: $FixMe}

export default class TimelineInstanceObject {
  _objectTemplate: ObjectTemplate
  _propInstances: {[propName: string]: PropInstance} = {}
  _project: Project
  facade: TheatreJSTimelineInstanceObject
  constructor(
    readonly _timelineInstance: TimelineInstance,
    readonly path: string,
    readonly nativeObject: $FixMe,
    readonly config: NativeObjectTypeConfig | undefined,
    type: NativeObjectType
  ) {
    this._project = _timelineInstance._project
    this._objectTemplate = this._timelineInstance._timelineTemplate.getObjectTemplate(
      path,
      nativeObject,
      config,
      type
    )

    const adapter = this._objectTemplate.adapter
    if (adapter && adapter.start) {
      adapter.start!(this, nativeObject, config)
    }

    this.facade = new TheatreJSTimelineInstanceObject(this)
  }

  getProp(name: string) {
    if (!this._objectTemplate.nativeObjectType.props[name]) {
      throw new Error(
        `Object '${this.path}' does not have a prop named ${JSON.stringify(
          name,
        )}. ${didYouMean(
          name,
          Object.keys(this._objectTemplate.nativeObjectType.props),
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
      this._objectTemplate.nativeObjectType.props,
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

    const untap = der.changes(this._objectTemplate._project.ticker).tap(v => {
      callback(v, this._timelineInstance.time)
    })

    this._project.ticker.registerSideEffect(() => {
      callback(der.getValue(), this._timelineInstance.time)
    })

    return untap
  }
}
