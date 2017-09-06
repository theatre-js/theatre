// @flow
import EventEmitter from './EventEmitter'
import {type Diff} from '../types'

export default class AbstractReference {
  isReference = true
  events: EventEmitter
  _parent: ?AbstractReference

  +unboxDeep: () => mixed

  constructor() {
    this.events = new EventEmitter()
    this._parent = null
  }

  _setParent(p: AbstractReference) {
    if (this._parent)
      throw new Error(`This reference already does have a parent`)

    this._parent = p
  }

  _reportChange(diff: Diff) {

  }

}