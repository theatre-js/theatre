// @flow
import {type Diff} from '../types'
import Emitter from './Emitter'
import Tappable from './Tappable'

export interface IAbstractReference {
  isAbstractReference: true,
  +unboxDeep: () => mixed,
  _setParent(p: IAbstractReference): void,
  _reportChange(diff: Diff): void,
  diffs(): Tappable<Diff>,
  _diffEmitter: Emitter<Diff>,
  _parent: ?IAbstractReference,
  isReference: true,
}

export default class AbstractReference implements IAbstractReference {
  isAbstractReference = true
  isReference = true
  _diffEmitter: Emitter<Diff>
  _parent: ?IAbstractReference
  +unboxDeep: () => mixed

  constructor() {
    this._diffEmitter = new Emitter()
    this._parent = null
  }

  diffs() {
    return this._diffEmitter.tappable
  }

  _setParent(p: IAbstractReference) {
    if (this._parent)
      throw new Error(`This reference already does have a parent`)

    this._parent = p
  }

  _reportChange(diff: Diff) {

  }
}