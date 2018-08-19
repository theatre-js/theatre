import InternalTimeline from '$tl/timelines/InternalTimeline'
import {
  NativeObjectTypeConfig,
  getTypeOfNativeObject,
  NativeObjectType,
} from './objectTypes'
import { ObjectAddress } from '$tl/handy/addresses';

export default class InternalObject {
  nativeObjectType: NativeObjectType
  _address: ObjectAddress
  
  public get _project() {
    return this.internalTimeline.project
  }

  public get _pointerToState() {
    return this.internalTimeline._pointerToState.objects[this.path]
  }
  
  constructor(
    readonly internalTimeline: InternalTimeline,
    readonly path: string,
    initialNativeObject: $FixMe,
    initialNativeobjectConfig: NativeObjectTypeConfig | undefined,
  ) {
    this._address = {...internalTimeline._address, objectPath: path}
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
