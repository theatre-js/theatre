import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import {
  NativeObjectTypeConfig,
  NativeObjectType,
  getAdapterOfNativeObject,
  ObjectProps,
} from './objectTypes'
import {ObjectAddress} from '$tl/handy/addresses'
import {NativeObjectAdapter} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import atom, {Atom} from '$shared/DataVerse/atom'

export default class ObjectTemplate {
  // nativeObjectType: NativeObjectType
  _address: ObjectAddress
  adapter: void | NativeObjectAdapter
  atom: Atom<{
    objectProps: ObjectProps
  }>

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
    nativeObjectType: NativeObjectType,
  ) {
    this._address = {...timelineTemplate._address, objectPath: path}
    this.atom = atom({
      objectProps: nativeObjectType.props,
    })

    this.adapter = getAdapterOfNativeObject(
      this.timelineTemplate.project,
      initialNativeObject,
      initialNativeobjectConfig,
    )
  }

  override(
    nativeObject: $FixMe,
    nativeobjectConfig: NativeObjectTypeConfig | undefined,
    nativeObjectType: NativeObjectType,
  ) {
    this.adapter = getAdapterOfNativeObject(
      this.timelineTemplate.project,
      nativeObject,
      nativeobjectConfig,
    )

    this.atom.reduceState(['objectProps'], () => nativeObjectType.props)
  }

  ensureNativeObjectIsAcceptable(
    // @ts-ignore
    nativeObject: $FixMe,
    // @ts-ignore
    config?: NativeObjectTypeConfig,
  ) {}
}
