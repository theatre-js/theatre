import InternalTimeline from '$tl/timelines/InternalTimeline'
import {
  NativeObjectTypeConfig,
  getTypeOfNativeObject,
  NativeObjectType,
} from './objectTypes'

export default class InternalObject {
  nativeObjectType: NativeObjectType
  constructor(
    readonly internalTimeline: InternalTimeline,
    readonly path: string,
    initialNativeObject: $FixMe,
    initialNativeobjectConfig: NativeObjectTypeConfig,
  ) {
    this.nativeObjectType = getTypeOfNativeObject(
      this.internalTimeline.project,
      initialNativeObject,
      initialNativeobjectConfig,
    )
  }

  ensureNativeObjectIsAcceptable(
    nativeObject: $FixMe,
    config: NativeObjectTypeConfig,
  ) {}
}
