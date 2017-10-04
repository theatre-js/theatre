// @flow
import WiryMapFace from './WiryMapFace'
import type {MapKey} from '$shared/DataVerse/types'
import Context from '$shared/DataVerse/Context'
import Emitter from '$shared/DataVerse/utils/Emitter'

export interface IDerivedMap {

}

type Constructor = $FixMe

let lastId: number = 0

export default class WiryMap<O: {}> {
  _id: number
  _constructors: {[key: MapKey]: Constructor}
  _parent: ?WiryMap<$FixMe>
  _parentChagnesEmitter: *

  constructor(constructors: O, delegateTo?: WiryMap<$FixMe>): void{
    this._id = lastId++
    this._constructors = constructors
    this._parent = delegateTo
    this._parentChagnesEmitter = new Emitter()
  }

  parentChanges() {
    return this._parentChagnesEmitter.tappable
  }

  extend(constructors: {}): WiryMap<$FixMe> {
    return new WiryMap(constructors, this)
  }

  face(context: Context): WiryMapFace{
    return new WiryMapFace(this, context)
  }

  _getConstructor(key: MapKey): Constructor {
    return this._constructors[key]
  }

  getParent(): ?(WiryMap<any>){
    return this._parent
  }

  setParent(p: WiryMap<$FixMe>): void{
    this._parent = p
    this._parentChagnesEmitter.emit(p)
  }
}