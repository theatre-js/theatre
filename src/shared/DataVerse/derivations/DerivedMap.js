
// @flow
import DerivedMapFace from './DerivedMapFace'
import type {MapKey} from '$shared/DataVerse/types'
import Context from '$shared/DataVerse/Context'
import Emitter from '$shared/DataVerse/utils/Emitter'

export interface IDerivedMap {

}

type Constructor = $FixMe

let lastId = 0

export default class DerivedMap {
  _id: number
  _constructors: {[key: MapKey]: Constructor}
  _parent: ?DerivedMap
  _parentChagnesEmitter: *

  constructor(constructors: {}, delegateTo?: DerivedMap) {
    this._id = lastId++
    this._constructors = constructors
    this._parent = delegateTo
    this._parentChagnesEmitter = new Emitter()
  }

  parentChanges() {
    return this._parentChagnesEmitter.tappable
  }

  extend(constructors: {}) {
    return new DerivedMap(constructors, this)
  }

  face(context: Context) {
    return new DerivedMapFace(this, context)
  }

  _getConstructor(key: MapKey): Constructor {
    return this._constructors[key]
  }

  getParent() {
    return this._parent
  }

  setParent(p: DerivedMap) {
    this._parent = p
    this._parentChagnesEmitter.emit(p)
  }
}