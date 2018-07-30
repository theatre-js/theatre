import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from './objectTypes'

export default class TimelineInstanceObject {
  _internalObject: InternalObject
  constructor(
    readonly _timelineInstance: TimelineInstance,
    readonly path: string,
    readonly nativeObject: $FixMe,
    readonly config: NativeObjectTypeConfig,
  ) {
    this._internalObject = this._timelineInstance._internalTimeline.getInternalObject(
      path,
      nativeObject,
      config,
    )
  }
}
