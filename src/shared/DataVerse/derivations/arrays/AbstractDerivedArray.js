
import type {IDerivedArray} from './types' // eslint-disable-line flowtype/require-valid-file-annotation
import Emitter from '$shared/DataVerse/utils/Emitter'

let lastId: number = 0

export default class AbstractDerivedArray {
  _id: number
  isDerivedArray = 'True'

  constructor() {
    this._trace = new Error('Trace')
    this._id = lastId++
    this._changeEmitter = new Emitter()
    this._changeEmitterHasTappers = false
    this._changeEmitter.onNumberOfTappersChange(() => {this._reactToNumberOfChangeTappersChange()})
  }

  _reactToNumberOfChangeTappersChange() {
    const hasTappers = this._changeEmitter.hasTappers()
    if (hasTappers === this._changeEmitterHasTappers) return
    this._changeEmitterHasTappers = hasTappers
    if (hasTappers) {
      this._reactToHavingTappers()
    } else {
      this._reactToNotHavingTappers()
    }
  }

  changes() {
    return this._changeEmitter.tappable
  }

  pointer() {
    if (!this._pointer) {
      this._pointer = pointer.default({root: this, path: []})
    }
    return this._pointer
  }

  concat(right: IDerivedArray<$FixMe>) {
    return concatDerivedArray.default(this, right)
  }

  reduce(fn, acc) {
    return reduceDerivedArray.default(this, fn, acc)
  }

  map(fn) {
    return mapDerivedArray.default(this, fn)
  }
}

const pointer = require('$shared/DataVerse/derivations/pointer')
const concatDerivedArray = require('./concatDerivedArray')
const reduceDerivedArray = require('./reduceDerivedArray')
const mapDerivedArray = require('./mapDerivedArray')