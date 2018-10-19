import InternalProject from '$tl/Project/InternalProject'
import InternalObject from '$tl/objects/InternalObject'
import {NativeObjectTypeConfig} from '$tl/objects/objectTypes'
import atom, {
  Atom,
  valueDerivation,
  val,
  coldVal,
} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import {TimelineAddress} from '$tl/handy/addresses'
import {ConstantDerivation} from '$shared/DataVerse/derivations/constant'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'

// export type RangeState = {
//   duration: number
//   // rangeShownInPanel: {
//   //   from: number
//   //   to: number
//   // }
//   temporarilyLimitedPlayRange: null | {from: number; to: number}
// }

export default class InternalTimeline {
  _address: TimelineAddress

  _playableRangeD: undefined | AbstractDerivation<{start: number; end: number}>

  readonly _internalObjects: Atom<{[path: string]: InternalObject}> = new Atom(
    {},
  )

  readonly _durationD = autoDerive(() => {
    return val(
      this.internalProject._selectors.historic.getTimelineDuration(
        this.internalProject.atomP.historic,
        this.address,
      ),
    )
  })

  public get _pointerToState() {
    return this.internalProject.atomP.historic.internalTimelines[this._path]
  }

  // protected _rangeState: Atom<RangeState> = atom({
  //   duration: 20000,
  //   // rangeShownInPanel: {from: 0, to: 8000},
  //   temporarilyLimitedPlayRange: null,
  // })

  // public pointerToRangeState: Pointer<RangeState>

  constructor(readonly internalProject: InternalProject, readonly _path: string) {
    // this.pointerToRangeState = this._rangeState.pointer
    this._address = {...this.internalProject._address, timelinePath: _path}
    this._playableRangeD = undefined
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

  // _setRangeShownInPanel = (p: {from: number; to: number}) => {
  //   this._rangeState.reduceState(['rangeShownInPanel'], () => p)
  // }

  // _setTemporarilyLimitedPlayRange(p: null | {from: number; to: number}) {
  //   this._rangeState.reduceState(['temporarilyLimitedPlayRange'], () => p)
  // }

  _getPlayableRangeD() {
    if (this._playableRangeD) return this._playableRangeD
    const startD = new ConstantDerivation(0)
    const durD = this._durationD
    const endD = durD

    const playableRangeD = (this._playableRangeD = autoDerive(() => {
      return {start: startD.getValue(), end: endD.getValue()}
    }))

    return playableRangeD
  }

  get duration() {
    return this._durationD.getValue()
  }

  get address() {
    return this._address
  }
}
