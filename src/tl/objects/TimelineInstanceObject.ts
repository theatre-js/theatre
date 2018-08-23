import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from './objectTypes'
import {VoidFn} from '$shared/types'
import didYouMean from '$shared/utils/didYouMean'
import PropInstance from './PropInstance'
import { mapValues } from 'lodash';
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive';
import { val } from '$shared/DataVerse2/atom';

type Values = {[k: string]: $FixMe}

export default class TimelineInstanceObject {
  _internalObject: InternalObject
  _propInstances: {[propName: string]: PropInstance} = {}
  constructor(
    readonly _timelineInstance: TimelineInstance,
    readonly path: string,
    readonly nativeObject: $FixMe,
    readonly config: NativeObjectTypeConfig | undefined,
  ) {
    this._internalObject = this._timelineInstance._internalTimeline.getInternalObject(
      path,
      nativeObject,
      config,
    )
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
    const props = mapValues(this._internalObject.nativeObjectType.props, (_, propName) => {
      return this.getProp(name)
    })

    const timeP = this._timelineInstance.statePointer.time

    const der = autoDerive(() => {
      const time = val(timeP)
      const values = mapValues(props, (prop) => {
        // return prop._value
      })
    })

    return () => {

    }
  }
}
