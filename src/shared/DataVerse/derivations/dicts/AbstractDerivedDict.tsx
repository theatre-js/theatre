import Emitter from '$shared/DataVerse/utils/Emitter'

export default abstract class AbstractDerivedDict<O> {
  _changeEmitter: Emitter<$FixMe>
  _untapFromSourceChanges: $FixMe
  _changeEmitterHasTappers: boolean
  abstract _reactToHavingTappers(): void
  abstract _reactToNotHavingTappers(): void
  isDerivedDict = true
  _trace: $FixMe
  _pointer: $FixMe
  abstract keys(): string[]

  constructor() {
    if (process.env.KEEPING_DERIVATION_TRACES === true) {
      this._trace = new Error('trace')
    }
    this._changeEmitter = new Emitter()
    this._changeEmitterHasTappers = false
    this._changeEmitter.onNumberOfTappersChange(() => {
      this._reactToNumberOfChangeTappersChange()
    })
    this._pointer = undefined
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
      this._pointer = pointer.default({type: 'WithPath', root: this, path: []})
    }
    return this._pointer
  }

  proxy(): $IntentionalAny {
    return proxyDerivedDict.default(this as $IntentionalAny)
  }

  extend(x: $IntentionalAny): $IntentionalAny {
    return extend.default(this as $IntentionalAny, x)
  }

  mapValues(fn: $IntentionalAny): $IntentionalAny {
    return mapValues.default(this as $IntentionalAny, fn)
  }

  toJS() {
    throw new Error('Not implemented') // @todo
  }
}

const pointer = require('$shared/DataVerse/derivations/pointer')
const proxyDerivedDict = require('./proxyDerivedDict')
const extend = require('./extend')
const mapValues = require('./mapValues')
