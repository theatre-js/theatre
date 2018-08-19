import Project from '$tl/Project/Project'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import atom, {Atom} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import { TimelineAddress } from '$tl/handy/addresses';

type RangeState = {
  duration: number
  rangeShownInPanel: {
    from: number
    to: number
  }
  temporarilyLimitedPlayRange: null | {from: number; to: number}
}

export default class InternalTimeline {
  _address: TimelineAddress
  readonly _internalObjects: Atom<{[path: string]: InternalObject}> = new Atom(
    {},
  )

  public get _pointerToState() {
    return this.project.atomP.historic.internalTimeines[this._path]
  }

  protected _rangeState: Atom<RangeState> = atom({
    duration: 2000,
    rangeShownInPanel: {from: 0, to: 2000},
    temporarilyLimitedPlayRange: null,
  })

  public pointerToRangeState: Pointer<RangeState>

  constructor(readonly project: Project, readonly _path: string) {
    this.pointerToRangeState = this._rangeState.pointer
    this._address = {...this.project._address, timelinePath: _path}
  }

  getInternalObject(
    path: string,
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
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

  _setRangeShownInPanel(p: {from: number; to: number}) {
    this._rangeState.reduceState(['rangeShownInPanel'], () => p)
  }

  _setTemporarilyLimitedPlayRange(p: null | {from: number; to: number}) {
    this._rangeState.reduceState(['temporarilyLimitedPlayRange'], () => p)
  }
}
