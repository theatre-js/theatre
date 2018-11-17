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

type Values = {[k: string]: $FixMe}
export type OnValuesChangeCallback = (values: Values, time: number) => void

export default class TimelineInstanceObject {
  _objectTemplate: ObjectTemplate
  _propInstances: {[propName: string]: PropInstance} = {}
  _project: Project
  facade: TheatreJSTimelineInstanceObject
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

    const adapter = this._objectTemplate.adapter
    if (adapter && adapter.start) {
      this._project.ready.then(() => {
        const stopFn = adapter.start!(this.facade)
        if (!$env.tl.isCore) {
          if (typeof stopFn !== 'function') {
            console.warn(
              warningForWhenAdapterDotStartDoesntReturnFunction(adapter),
            )
          }
        }
      })
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

  onValuesChange(callback: OnValuesChangeCallback): VoidFn {
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
