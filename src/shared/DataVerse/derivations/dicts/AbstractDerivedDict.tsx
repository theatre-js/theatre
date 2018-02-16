import Emitter from '$shared/DataVerse/utils/Emitter'
import {PointerDerivation} from '../pointer'
import {PropOfPointer} from '../pointerTypes'
import {DictAtom} from '$src/shared/DataVerse/atoms/dict'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'
import {BoxAtom} from '$src/shared/DataVerse/atoms/box'
import { ExtendDerivedDict } from './extend';

export type DerivedDictChangeType<O> = {
  addedKeys: Array<keyof O>
  deletedKeys: Array<keyof O>
}

// @todo also support ArrayAtom
export type PropOfADD<V> =
  V extends DictAtom<infer O> ? AbstractDerivedDict<O> :
  V extends BoxAtom<infer T> ? T :
  V

export default abstract class AbstractDerivedDict<O> {
  isDerivedDict = true
  _o: O
  _changeEmitter: Emitter<DerivedDictChangeType<O>>
  _changeEmitterHasTappers: boolean

  _trace: $IntentionalAny
  _pointer: undefined | PointerDerivation<this>

  abstract _reactToHavingTappers(): void
  abstract _reactToNotHavingTappers(): void
  abstract keys(): Array<keyof O>
  abstract prop<K extends keyof O>(key: K): AbstractDerivation<PropOfADD<O[K]>>

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

  pointer(): PointerDerivation<AbstractDerivedDict<O>> {
    const cachedPointer = this._pointer
    if (!cachedPointer) {
      const p = pointer.default({type: 'WithPath', root: this, path: []})
      this._pointer = p
      return p
    } else {
      return cachedPointer
    }
  }

  proxy(): $IntentionalAny {
    return proxyDerivedDict.default(this as $IntentionalAny)
  }

  extend<R>(x: AbstractDerivedDict<R>): ExtendDerivedDict<O, R> {
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
