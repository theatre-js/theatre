// @flow
import DerivedMapFace from './DerivedMapFace'
import type {MapKey} from '$shared/DataVerse/types'
import Context from '$shared/DataVerse/Context'
import Emitter from '$shared/DataVerse/utils/Emitter'

export interface IDerivedMap {

}

type Constructor = $FixMe

let lastId: number = 0

export default class DerivedMap<O: {}> {
  _id: number
  _constructors: {[key: MapKey]: Constructor}
  _parent: ?DerivedMap<$FixMe>
  _parentChagnesEmitter: *

  constructor(constructors: O, delegateTo?: DerivedMap<$FixMe>): void{
    this._id = lastId++
    this._constructors = constructors
    this._parent = delegateTo
    this._parentChagnesEmitter = new Emitter()
  }

  parentChanges() {
    return this._parentChagnesEmitter.tappable
  }

  extend(constructors: {}): DerivedMap<$FixMe> {
    return new DerivedMap(constructors, this)
  }

  face(context: Context): DerivedMapFace{
    return new DerivedMapFace(this, context)
  }

  _getConstructor(key: MapKey): Constructor {
    return this._constructors[key]
  }

  getParent(): ?(DerivedMap<any>){
    return this._parent
  }

  setParent(p: DerivedMap<$FixMe>): void{
    this._parent = p
    this._parentChagnesEmitter.emit(p)
  }
}