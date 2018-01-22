// @flow
import PrototypalDictFace from './PrototypalDictFace'
import {MapKey} from '$shared/DataVerse/types'
import Ticker from '$shared/DataVerse/Ticker'
import Emitter from '$shared/DataVerse/utils/Emitter'
import Tappable from '$shared/DataVerse/utils/Tappable'
import {mapValues} from 'lodash'

type Constructor = $FixMe

let lastId: number = 0

export interface IPrototypalDict<O> {
  _id: number
  parentChanges(): Tappable<$FixMe>
  extend(constructors: {}): IPrototypalDict<$FixMe>
  face(ticker: Ticker): PrototypalDictFace
  _getConstructor(key: string): Constructor
  getParent(): void | IPrototypalDict<any>
  setParent(p: IPrototypalDict<$FixMe>): void
  keys(): {[k: string]: void}
}

export class PrototypalDict<O> implements IPrototypalDict<O> {
  _id: number
  _constructors: {[key: string]: Constructor}
  _parent: void | IPrototypalDict<$FixMe>
  _parentChagnesEmitter: $FixMe

  constructor(constructors: O, delegateTo?: IPrototypalDict<$FixMe>) {
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

  face(ticker: Ticker): PrototypalDictFace {
    return new PrototypalDictFace(this, ticker)
  }

  _getConstructor(key: MapKey): Constructor {
    return this._constructors[key]
  }

  getParent(): void | IPrototypalDict<any> {
    return this._parent
  }

  setParent(p: IPrototypalDict<$FixMe>): void {
    this._parent = p
    this._parentChagnesEmitter.emit(p)
  }

  keys() {
    const parentKeys = this._parent ? this._parent.keys() : {}
    const ourKeys = mapValues(this._constructors, () => undefined)
    return {...parentKeys, ...ourKeys}
  }
}

export default function prototypalDict<O>(o: O): IPrototypalDict<O> {
  return new PrototypalDict(o)
}
