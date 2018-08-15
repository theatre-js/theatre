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
    initialNativeobjectConfig: NativeObjectTypeConfig | undefined,
  ) {
    const type = getTypeOfNativeObject(
      this.internalTimeline.project,
      initialNativeObject,
      initialNativeobjectConfig,
    )
    if (!type) {
      // @todo better error
      console.error(`Could not determine type of object:`, initialNativeObject)
      throw new Error(`Could not determine type of object`)
    }
    this.nativeObjectType = type
  }

  ensureNativeObjectIsAcceptable(
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
  ) {}
}
