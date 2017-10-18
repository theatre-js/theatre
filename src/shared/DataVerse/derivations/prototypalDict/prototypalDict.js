// @flow
import PrototypalDictFace from './PrototypalDictFace'
import type {MapKey} from '$shared/DataVerse/types'
import Context from '$shared/DataVerse/Context'
import Emitter from '$shared/DataVerse/utils/Emitter'
import type {default as Tappable} from '$shared/DataVerse/utils/Tappable'

type Constructor = $FixMe

let lastId: number = 0

export interface IPrototypalDict<O: {}> {
  _id: number,
  parentChanges(): Tappable<*>,
  extend(constructors: {}): IPrototypalDict<$FixMe>,
  face(context: Context): PrototypalDictFace,
  _getConstructor(key: MapKey): Constructor,
  getParent(): ?IPrototypalDict<any>,
  setParent(p: IPrototypalDict<$FixMe>): void,
}

export class PrototypalDict<O: {}> implements IPrototypalDict<O> {
  _id: number
  _constructors: {[key: MapKey]: Constructor}
  _parent: ?IPrototypalDict<$FixMe>
  _parentChagnesEmitter: *

  constructor(constructors: O, delegateTo?: IPrototypalDict<$FixMe>): IPrototypalDict<O> {
    this._id = lastId++
    this._constructors = constructors
    this._parent = delegateTo
    this._parentChagnesEmitter = new Emitter()
    return this
  }

  parentChanges() {
    return this._parentChagnesEmitter.tappable
  }

  extend(constructors: {}): IPrototypalDict<$FixMe> {
    return new PrototypalDict(constructors, this)
  }

  face(context: Context): PrototypalDictFace {
    return new PrototypalDictFace(this, context)
  }

  _getConstructor(key: MapKey): Constructor {
    return this._constructors[key]
  }

  getParent(): ?(IPrototypalDict<any>){
    return this._parent
  }

  setParent(p: IPrototypalDict<$FixMe>): void{
    this._parent = p
    this._parentChagnesEmitter.emit(p)
  }
}

export default function prototypalDict<O: {}>(o: O): IPrototypalDict<O> {
  return new PrototypalDict(o)
}