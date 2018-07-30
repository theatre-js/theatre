import Project from '$tl/Project/Project'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import {Atom} from '$shared/DataVerse2/atom'

export default class InternalTimeline {
  readonly _internalObjects: Atom<{[path: string]: InternalObject}> = new Atom(
    {},
  )
  constructor(readonly project: Project, protected _path: string) {}

  getInternalObject(
    path: string,
    nativeObject: $FixMe,
    config: NativeObjectTypeConfig,
  ) {
    let internalObject = this._internalObjects.getState()[path]
    if (!internalObject) {
      internalObject = new InternalObject(this, path, nativeObject, config)
      this._internalObjects.reduceState([path], () => internalObject)
    } else {
      internalObject.ensureNativeObjectIsAcceptable(nativeObject, config)
    }

    return internalObject
  }
}
