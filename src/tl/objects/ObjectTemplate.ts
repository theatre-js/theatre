import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import {
  NativeObjectTypeConfig,
  NativeObjectType,
  getAdapterOfNativeObject,
} from './objectTypes'
import {ObjectAddress} from '$tl/handy/addresses'
import {NativeObjectAdapter} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'

export default class ObjectTemplate {
  // nativeObjectType: NativeObjectType
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
    readonly nativeObjectType: NativeObjectType,
  ) {
    this._address = {...timelineTemplate._address, objectPath: path}

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
