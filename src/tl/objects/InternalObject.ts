import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import {
  NativeObjectTypeConfig,
  getTypeOfNativeObject,
  NativeObjectType,
  getAdapterOfNativeObject,
} from './objectTypes'
import {ObjectAddress} from '$tl/handy/addresses'
import {NativeObjectAdapter} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'

export default class InternalObject {
  nativeObjectType: NativeObjectType
  _address: ObjectAddress
  adapter: void | NativeObjectAdapter

  public get _project() {
    return this.timelineTemplate.project
  }

  public get _pointerToState() {
    return this.timelineTemplate._pointerToState.objects[this.path]
  }

  constructor(
    readonly timelineTemplate: TimelineTemplate,
    readonly path: string,
    initialNativeObject: $FixMe,
    initialNativeobjectConfig: NativeObjectTypeConfig | undefined,
  ) {
    this._address = {...timelineTemplate._address, objectPath: path}
    const type = getTypeOfNativeObject(
      this.timelineTemplate.project,
      initialNativeObject,
      initialNativeobjectConfig,
    )
    if (!type) {
      // @todo better error
      console.error(`Could not determine type of object:`, initialNativeObject)
      throw new Error(`Could not determine type of object`)
    }
    this.nativeObjectType = type

    this.adapter = getAdapterOfNativeObject(
      this.timelineTemplate.project,
      initialNativeObject,
      initialNativeobjectConfig,
    )
  }

  ensureNativeObjectIsAcceptable(
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
  ) {}
}
